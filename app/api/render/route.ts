import { NextRequest, NextResponse } from 'next/server';
import { getKrokiType, isEngine, isFormat } from '@/lib/diagramConfig';
import { logger } from '@/lib/logger';
import { APP_CONFIG } from '@/lib/config';
import { checkRateLimit, pruneRateLimitCache } from '@/lib/server/rateLimit';
import {
  deleteInflightRender,
  getCachedRender,
  getInflightRender,
  keyOfRender,
  pruneRenderCache,
  setCachedRender,
  setInflightRender,
  type RenderCacheEntry,
} from '@/lib/server/renderCache';

// Detect static export mode / 检测静态导出模式
const isStaticExport =
  process.env.GITHUB_PAGES === 'true' || process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

export const runtime = 'nodejs';
// API routes are removed during static export build, so always use force-dynamic
// API 路由在静态导出构建期间会被移除，因此始终使用 force-dynamic
export const dynamic = 'force-dynamic';

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

  // === 请求体大小限制 ===
  const MAX_BODY_SIZE = 150_000; // 略大于 maxCodeLength (100KB)
  const contentLength = req.headers.get('content-length');
  const transferEncoding = req.headers.get('transfer-encoding');

  // 检查 Content-Length（对于有明确长度的请求）
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    logger.warn('render', { message: 'Request body too large', contentLength });
    return NextResponse.json(
      { error: 'Request body too large', code: 'PAYLOAD_TOO_LARGE', maxLength: MAX_BODY_SIZE },
      { status: 413 },
    );
  }

  // 检查 Transfer-Encoding: chunked（流式请求）
  // Next.js 默认有内置限制，但我们记录警告以便监控
  if (transferEncoding?.toLowerCase().includes('chunked')) {
    logger.info('render', {
      message: 'Chunked transfer encoding detected, relying on Next.js body limit',
    });
  }

  // === 速率限制检查 ===
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  pruneRateLimitCache();
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
    pruneRenderCache(now);

    const k = keyOfRender(base, engine, format, code);
    const cached = getCachedRender(k);
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

    let task = getInflightRender(k);
    if (!task) {
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
        const cacheEntry: RenderCacheEntry = {
          expires: Date.now() + APP_CONFIG.cache.ttlMs,
          contentType,
        };

        if (format === 'svg') {
          const svgText = new TextDecoder().decode(buffer);
          cacheEntry.svg = svgText;
        } else {
          const base64 = buffer.toString('base64');
          cacheEntry.base64 = base64;
        }

        setCachedRender(k, cacheEntry);
        pruneRenderCache(Date.now());

        return { buffer, cacheEntry };
      })().finally(() => {
        deleteInflightRender(k);
      });
      setInflightRender(k, task);
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
        return NextResponse.json({ contentType, svg: svgText }, { headers: rateLimitHeaders });
      }
      const base64 = cacheEntry.base64 ?? buffer.toString('base64');
      return NextResponse.json({ contentType, base64 }, { headers: rateLimitHeaders });
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
