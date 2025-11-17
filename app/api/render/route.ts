import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ENGINES = new Set(['mermaid', 'plantuml', 'graphviz', 'flowchart']);
const FORMATS = new Set(['svg', 'png', 'pdf']);

type CacheEntry = { expires: number; contentType: string; svg?: string; base64?: string };
const CACHE_TTL_MS = 120000;
const cache = new Map<string, CacheEntry>();

function keyOf(engine: string, format: string, code: string): string {
  const h = crypto.createHash('sha256').update(code).digest('hex');
  return `${engine}|${format}|${h}`;
}

export async function POST(req: NextRequest) {
  try {
    const { engine, format, code, binary } = await req.json();
    if (!engine || !format || !code) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!ENGINES.has(engine)) {
      return NextResponse.json({ error: 'Unsupported engine' }, { status: 400 });
    }
    if (!FORMATS.has(format)) {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    const type = engine === 'flowchart' ? 'mermaid' : engine;
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

    const krokiResp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Accept': accept,
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36 GraphViewer/0.1'
      },
      body: code,
      // cache: 'no-store' // not supported on all runtimes
    });

    if (!krokiResp.ok) {
      const text = await krokiResp.text().catch(() => '');
      return NextResponse.json({ error: 'Kroki render error', status: krokiResp.status, krokiUrl: url, details: text.slice(0, 2000) }, { status: 502 });
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
    return NextResponse.json({ error: 'Server error', message: e?.message || '' }, { status: 500 });
  }
}
