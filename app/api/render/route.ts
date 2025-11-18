import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ENGINE_SET, FORMAT_SET, getKrokiType, isEngine, isFormat } from '@/lib/diagramConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CODE_LENGTH = 100000;
const KROKI_TIMEOUT_MS = 10000;

type CacheEntry = { expires: number; contentType: string; svg?: string; base64?: string };
const CACHE_TTL_MS = 120000;
const cache = new Map<string, CacheEntry>();

function keyOf(engine: string, format: string, code: string): string {
  const h = crypto.createHash('sha256').update(code).digest('hex');
  return `${engine}|${format}|${h}`;
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body', code: 'INVALID_BODY' }, { status: 400 });
    }

    const { engine, format, code, binary } = body as {
      engine?: string;
      format?: string;
      code?: string;
      binary?: boolean;
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
    const base = (process.env.KROKI_BASE_URL || 'https://kroki.io').replace(/\/$/, '');
    const url = `${base}/${type}/${format}`;
    const accept = format === 'svg' ? 'image/svg+xml' : format === 'png' ? 'image/png' : 'application/pdf';

    const k = keyOf(engine, format, code);
    const cached = cache.get(k);
    if (cached && cached.expires > Date.now()) {
      if (binary) {
        if (format === 'svg' && cached.svg) {
          return new NextResponse(Buffer.from(cached.svg), {
            status: 200,
            headers: {
              'Content-Type': cached.contentType,
              'Content-Disposition': `attachment; filename=diagram.${format}`,
            },
          });
        }
        if (cached.base64) {
          const buf = Buffer.from(cached.base64, 'base64');
          return new NextResponse(buf, {
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
        return NextResponse.json({ error: 'Kroki timeout', code: 'KROKI_TIMEOUT' }, { status: 504 });
      }
      console.error('[render] Kroki request failed', {
        engine,
        format,
        length: code.length,
        message: error?.message || '',
      });
      return NextResponse.json(
        { error: 'Kroki request failed', code: 'KROKI_NETWORK_ERROR', message: error?.message || '' },
        { status: 502 },
      );
    }

    if (!krokiResp.ok) {
      const text = await krokiResp.text().catch(() => '');
      console.error('[render] Kroki render error', {
        engine,
        format,
        status: krokiResp.status,
        length: code.length,
      });
      return NextResponse.json(
        {
          error: 'Kroki render error',
          status: krokiResp.status,
          krokiUrl: url,
          code: 'KROKI_ERROR',
          details: text.slice(0, 2000),
        },
        { status: 502 },
      );
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
      cache.set(k, cacheEntry);
      if (!binary) {
        return NextResponse.json({ contentType, svg: svgText });
      }
    } else {
      const base64 = buffer.toString('base64');
      cacheEntry.base64 = base64;
      cache.set(k, cacheEntry);
      if (!binary) {
        return NextResponse.json({ contentType, base64 });
      }
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=diagram.${format}`,
      },
    });
  } catch (e: any) {
    console.error('[render] Unexpected server error', { message: e?.message || '' });
    return NextResponse.json({ error: 'Server error', message: e?.message || '' }, { status: 500 });
  }
}
