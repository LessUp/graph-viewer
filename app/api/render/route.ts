import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getKrokiType, isEngine, isFormat } from '@/lib/diagramConfig';
import { logger } from '@/lib/logger';
import { APP_CONFIG } from '@/lib/config';

// Detect static export mode / 检测静态导出模式
const isStaticExport =
  process.env.GITHUB_PAGES === 'true' || process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

export const runtime = 'nodejs';
// API routes are removed during static export build, so always use force-dynamic
// API 路由在静态导出构建期间会被移除，因此始终使用 force-dynamic
export const dynamic = 'force-dynamic';

// === 速率限制 ===
type RateLimitEntry = { count: number; resetAt: number };
const rateLimitCache = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const { windowMs, maxRequests } = APP_CONFIG.rateLimit;
  const entry = rateLimitCache.get(ip);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitCache.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// 定期清理速率限制缓存
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitCache) {
    if (entry.resetAt < now) {
      rateLimitCache.delete(ip);
    }
  }
}, APP_CONFIG.cache.pruneIntervalMs);

// === 缓存 ===
type CacheEntry = { expires: number; contentType: string; svg?: string; base64?: string };
const cache = new Map<string, CacheEntry>();
let lastPruneAt = 0;

const inflight = new Map<string, Promise<{ buffer: Buffer; cacheEntry: CacheEntry }>>();

function pruneCache(now: number) {
  const { maxEntries, pruneIntervalMs } = APP_CONFIG.cache;
  if (cache.size <= maxEntries && now - lastPruneAt < pruneIntervalMs) {
    return;
  }
  lastPruneAt = now;
  for (const [key, entry] of cache) {
    if (entry.expires <= now) {
      cache.delete(key);
    }
  }
  while (cache.size > maxEntries) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

// LRU 淘汰：删除最旧的 inflight 条目
function evictOldestInflight(): void {
  const oldestKey = inflight.keys().next().value as string | undefined;
  if (oldestKey) {
    inflight.delete(oldestKey);
    logger.debug('inflight-evict', { message: 'Evicted oldest inflight entry', remaining: inflight.size });
  }
}

function keyOf(base: string, engine: string, format: string, code: string): string {
  const h = crypto.createHash('sha256').update(code).digest('hex');
  return `${base}|${engine}|${format}|${h}`;
}

function normalizeKrokiBaseUrl(value: string): string | null {
  try {
    const u = new URL(value);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.username || u.password) return null;
    if (u.search || u.hash) return null;
    const pathname = u.pathname.replace(/\/$/, '');
    return `${u.origin}${pathname}`;
  } catch {
    return null;
  }
}

function parseKrokiBaseUrlAllowlist(raw: string | undefined): Set<string> {
  const parts = (raw || '')
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out = new Set<string>();
  for (const p of parts) {
    const n = normalizeKrokiBaseUrl(p);
    if (n) out.add(n);
  }
  return out;
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const out = new ArrayBuffer(buf.byteLength);
  new Uint8Array(out).set(buf);
  return out;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

type RenderErrorPayload = {
  error: string;
  code: string;
  status?: number;
  krokiUrl?: string;
  details?: string;
  message?: string;
  maxLength?: number;
};

class RenderError extends Error {
  status: number;
  payload: RenderErrorPayload;

  constructor(status: number, payload: RenderErrorPayload) {
    super(payload.error);
    this.status = status;
    this.payload = payload;
  }
}

export async function POST(req: NextRequest) {
  // NOTE: This code path is effectively unreachable in static export builds
  // because scripts/build-static-export.mjs removes the app/api directory.
  // The check remains for safety in case the API route is somehow accessed.
  if (isStaticExport) {
    return NextResponse.json(
      {
        error:
          'API not available in static export mode. Please use Docker deployment for full functionality.',
      },
      { status: 503 },
    );
  }

  // === 速率限制检查 ===
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.allowed) {
    logger.warn('render', { message: 'Rate limit exceeded', ip: clientIp });
    return NextResponse.json(
      {
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetAt / 1000)),
        },
      },
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body', code: 'INVALID_BODY' },
        { status: 400 },
      );
    }

    const { engine, format, code, binary, krokiBaseUrl } = body as {
      engine?: string;
      format?: string;
      code?: string;
      binary?: boolean;
      krokiBaseUrl?: string;
    };

    if (!engine || !format || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'MISSING_FIELDS' },
        { status: 400 },
      );
    }

    if (!isEngine(engine)) {
      logger.warn('render', { message: 'Unsupported engine', engine });
      return NextResponse.json(
        { error: 'Unsupported engine', code: 'UNSUPPORTED_ENGINE' },
        { status: 400 },
      );
    }
    if (!isFormat(format)) {
      logger.warn('render', { message: 'Unsupported format', format });
      return NextResponse.json(
        { error: 'Unsupported format', code: 'UNSUPPORTED_FORMAT' },
        { status: 400 },
      );
    }

    if (code.length > APP_CONFIG.render.maxCodeLength) {
      logger.error('render', { message: 'Code too long', engine, format, length: code.length });
      return NextResponse.json(
        {
          error: 'Code too long',
          code: 'PAYLOAD_TOO_LARGE',
          maxLength: APP_CONFIG.render.maxCodeLength,
        },
        { status: 413 },
      );
    }

    const type = getKrokiType(engine);

    const envBaseRaw = process.env.KROKI_BASE_URL || 'https://kroki.io';
    const envBase = normalizeKrokiBaseUrl(envBaseRaw);
    if (!envBase) {
      throw new RenderError(500, { error: 'Invalid KROKI_BASE_URL', code: 'INVALID_KROKI_CONFIG' });
    }

    let base = envBase;
    const requestedBaseRaw = typeof krokiBaseUrl === 'string' ? krokiBaseUrl.trim() : '';
    if (requestedBaseRaw) {
      const requested = normalizeKrokiBaseUrl(requestedBaseRaw);
      if (!requested) {
        throw new RenderError(400, {
          error: 'Invalid krokiBaseUrl',
          code: 'INVALID_KROKI_BASE_URL',
        });
      }

      // 安全策略：
      // 1. 如果 KROKI_ALLOW_CLIENT_BASE_URL=true，允许任意 URL（不推荐，仅用于开发测试）
      // 2. 否则，检查 KROKI_CLIENT_BASE_URL_ALLOWLIST 白名单
      // 3. 如果白名单为空，默认只允许 KROKI_BASE_URL
      const allowAny = (process.env.KROKI_ALLOW_CLIENT_BASE_URL || '').toLowerCase() === 'true';
      const allowlist = parseKrokiBaseUrlAllowlist(process.env.KROKI_CLIENT_BASE_URL_ALLOWLIST);

      if (allowAny) {
        // 允许任意 URL（生产环境不推荐）
        logger.warn('render', { message: 'Allowing arbitrary Kroki URL', requested });
        base = requested;
      } else if (allowlist.has(requested)) {
        // URL 在白名单中
        base = requested;
      } else if (requested === envBase) {
        // URL 与默认的 KROKI_BASE_URL 相同
        base = requested;
      } else {
        // 拒绝其他 URL
        throw new RenderError(400, {
          error:
            'krokiBaseUrl not allowed. Configure KROKI_CLIENT_BASE_URL_ALLOWLIST to allow custom URLs.',
          code: 'KROKI_BASE_URL_NOT_ALLOWED',
        });
      }
    }

    const url = `${base}/${type}/${format}`;
    const accept =
      format === 'svg' ? 'image/svg+xml' : format === 'png' ? 'image/png' : 'application/pdf';

    const now = Date.now();
    pruneCache(now);

    const k = keyOf(base, engine, format, code);
    const cached = cache.get(k);
    if (cached && cached.expires > now) {
      if (binary) {
        if (format === 'svg' && cached.svg) {
          return new NextResponse(toArrayBuffer(Buffer.from(cached.svg)), {
            status: 200,
            headers: {
              'Content-Type': cached.contentType,
              'Content-Disposition': `attachment; filename=diagram.${format}`,
            },
          });
        }
        if (cached.base64) {
          const buf = Buffer.from(cached.base64, 'base64');
          return new NextResponse(toArrayBuffer(buf), {
            status: 200,
            headers: {
              'Content-Type': cached.contentType,
              'Content-Disposition': `attachment; filename=diagram.${format}`,
            },
          });
        }
      } else {
        if (format === 'svg' && cached.svg) {
          return NextResponse.json({ contentType: cached.contentType, svg: cached.svg });
        } else if (cached.base64) {
          return NextResponse.json({ contentType: cached.contentType, base64: cached.base64 });
        }
      }
    }

    let task = inflight.get(k);
    if (!task) {
      // inflight Map 上限控制 - 使用 LRU 淘汰而非清空
      if (inflight.size >= APP_CONFIG.inflight.maxEntries) {
        logger.warn('render', { message: 'Inflight cache full, evicting oldest', size: inflight.size });
        evictOldestInflight();
      }

      task = (async () => {
        let krokiResp: Response;
        try {
          krokiResp = await fetchWithTimeout(
            url,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                Accept: accept,
                'User-Agent':
                  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36 GraphViewer/1.0.0',
              },
              body: code,
            },
            APP_CONFIG.render.timeoutMs,
          );
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            logger.error('render', {
              message: 'Kroki timeout',
              engine,
              format,
              timeoutMs: APP_CONFIG.render.timeoutMs,
              length: code.length,
            });
            throw new RenderError(504, {
              error: 'Kroki timeout',
              code: 'KROKI_TIMEOUT',
              krokiUrl: url,
            });
          }
          const errMsg = error instanceof Error ? error.message : '';
          logger.error('render', {
            message: 'Kroki network error',
            engine,
            format,
            length: code.length,
            error: errMsg,
          });
          throw new RenderError(502, {
            error: 'Kroki request failed',
            code: 'KROKI_NETWORK_ERROR',
            message: errMsg,
            krokiUrl: url,
          });
        }

        if (!krokiResp.ok) {
          const text = await krokiResp.text().catch(() => '');
          logger.error('render', {
            message: 'Kroki render error',
            engine,
            format,
            status: krokiResp.status,
            length: code.length,
          });
          throw new RenderError(502, {
            error: 'Kroki render error',
            status: krokiResp.status,
            krokiUrl: url,
            code: 'KROKI_ERROR',
            details: text.slice(0, 2000),
          });
        }

        const arrayBuffer = await krokiResp.arrayBuffer();
        const contentType =
          krokiResp.headers.get('content-type') ||
          (format === 'svg' ? 'image/svg+xml' : format === 'png' ? 'image/png' : 'application/pdf');
        const buffer = Buffer.from(arrayBuffer);
        const cacheEntry: CacheEntry = { expires: Date.now() + APP_CONFIG.cache.ttlMs, contentType };

        if (format === 'svg') {
          const svgText = new TextDecoder().decode(buffer);
          cacheEntry.svg = svgText;
        } else {
          const base64 = buffer.toString('base64');
          cacheEntry.base64 = base64;
        }

        cache.set(k, cacheEntry);
        pruneCache(Date.now());

        return { buffer, cacheEntry };
      })().finally(() => {
        inflight.delete(k);
      });
      inflight.set(k, task);
    }

    const { buffer, cacheEntry } = await task;
    const contentType = cacheEntry.contentType;

    // 速率限制响应头
    const rateLimitHeaders = {
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetAt / 1000)),
    };

    if (!binary) {
      if (format === 'svg') {
        const svgText = cacheEntry.svg ?? new TextDecoder().decode(buffer);
        return NextResponse.json(
          { contentType, svg: svgText },
          { headers: rateLimitHeaders },
        );
      }
      const base64 = cacheEntry.base64 ?? buffer.toString('base64');
      return NextResponse.json(
        { contentType, base64 },
        { headers: rateLimitHeaders },
      );
    }

    return new NextResponse(toArrayBuffer(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=diagram.${format}`,
        ...rateLimitHeaders,
      },
    });
  } catch (e: unknown) {
    if (e instanceof RenderError) {
      return NextResponse.json(e.payload, { status: e.status });
    }
    const errMsg = e instanceof Error ? e.message : '';
    logger.error('render', { message: 'Unexpected server error', error: errMsg });
    return NextResponse.json({ error: 'Server error', message: errMsg }, { status: 500 });
  }
}
