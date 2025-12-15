import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getKrokiType, isEngine, isFormat } from '@/lib/diagramConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CODE_LENGTH = 100000;
const KROKI_TIMEOUT_MS = 10000;

type CacheEntry = { expires: number; contentType: string; svg?: string; base64?: string };
const CACHE_TTL_MS = 120000;
const cache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 200;
const PRUNE_INTERVAL_MS = 30000;
let lastPruneAt = 0;

const inflight = new Map<string, Promise<{ buffer: Buffer; cacheEntry: CacheEntry }>>();

function pruneCache(now: number) {
  if (cache.size <= MAX_CACHE_ENTRIES && now - lastPruneAt < PRUNE_INTERVAL_MS) {
    return;
  }
  lastPruneAt = now;
  for (const [key, entry] of cache) {
    if (entry.expires <= now) {
      cache.delete(key);
    }
  }
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
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

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
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
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 });
    }

    const { engine, format, code, binary, krokiBaseUrl } = body as {
      engine?: string;
      format?: string;
      code?: string;
      binary?: boolean;
      krokiBaseUrl?: string;
    };

    if (!engine || !format || typeof code !== 'string') {
      return NextResponse.json({ error: 'Missing required fields', code: 'MISSING_FIELDS' }, { status: 400 });
    }

    if (!isEngine(engine)) {
      console.warn('[render] Unsupported engine', { engine });
      return NextResponse.json({ error: 'Unsupported engine', code: 'UNSUPPORTED_ENGINE' }, { status: 400 });
    }
    if (!isFormat(format)) {
      console.warn('[render] Unsupported format', { format });
      return NextResponse.json({ error: 'Unsupported format', code: 'UNSUPPORTED_FORMAT' }, { status: 400 });
    }

    if (code.length > MAX_CODE_LENGTH) {
      console.error('[render] Code too long', { engine, format, length: code.length });
      return NextResponse.json(
        { error: 'Code too long', code: 'PAYLOAD_TOO_LARGE', maxLength: MAX_CODE_LENGTH },
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
        throw new RenderError(400, { error: 'Invalid krokiBaseUrl', code: 'INVALID_KROKI_BASE_URL' });
      }
      const allowAny = (process.env.KROKI_ALLOW_CLIENT_BASE_URL || '').toLowerCase() === 'true';
      const allowlist = parseKrokiBaseUrlAllowlist(process.env.KROKI_CLIENT_BASE_URL_ALLOWLIST);
      if (!allowAny && !allowlist.has(requested)) {
        throw new RenderError(400, { error: 'krokiBaseUrl not allowed', code: 'KROKI_BASE_URL_NOT_ALLOWED' });
      }
      base = requested;
    }

    const url = `${base}/${type}/${format}`;
    const accept = format === 'svg' ? 'image/svg+xml' : format === 'png' ? 'image/png' : 'application/pdf';

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
                  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36 GraphViewer/0.1',
              },
              body: code,
            },
            KROKI_TIMEOUT_MS,
          );
        } catch (error: any) {
          if (error?.name === 'AbortError') {
            console.error('[render] Kroki request timed out', {
              engine,
              format,
              timeoutMs: KROKI_TIMEOUT_MS,
              length: code.length,
            });
            throw new RenderError(504, { error: 'Kroki timeout', code: 'KROKI_TIMEOUT', krokiUrl: url });
          }
          console.error('[render] Kroki request failed', {
            engine,
            format,
            length: code.length,
            message: error?.message || '',
          });
          throw new RenderError(502, {
            error: 'Kroki request failed',
            code: 'KROKI_NETWORK_ERROR',
            message: error?.message || '',
            krokiUrl: url,
          });
        }

        if (!krokiResp.ok) {
          const text = await krokiResp.text().catch(() => '');
          console.error('[render] Kroki render error', {
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
        const cacheEntry: CacheEntry = { expires: Date.now() + CACHE_TTL_MS, contentType };

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

    if (!binary) {
      if (format === 'svg') {
        const svgText = cacheEntry.svg ?? new TextDecoder().decode(buffer);
        return NextResponse.json({ contentType, svg: svgText });
      }
      const base64 = cacheEntry.base64 ?? buffer.toString('base64');
      return NextResponse.json({ contentType, base64 });
    }

    return new NextResponse(toArrayBuffer(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=diagram.${format}`,
      },
    });
  } catch (e: any) {
    if (e instanceof RenderError) {
      return NextResponse.json(e.payload, { status: e.status });
    }
    console.error('[render] Unexpected server error', { message: e?.message || '' });
    return NextResponse.json({ error: 'Server error', message: e?.message || '' }, { status: 500 });
  }
}
