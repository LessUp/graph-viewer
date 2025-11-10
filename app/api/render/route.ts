import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ENGINES = new Set(['mermaid', 'plantuml', 'graphviz', 'flowchart']);
const FORMATS = new Set(['svg', 'png', 'pdf']);

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

    if (binary) {
      return new NextResponse(Buffer.from(arrayBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename=diagram.${format}`,
        },
      });
    }

    if (format === 'svg') {
      const svgText = new TextDecoder().decode(arrayBuffer);
      return NextResponse.json({ contentType, svg: svgText });
    } else {
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return NextResponse.json({ contentType, base64 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', message: e?.message || '' }, { status: 500 });
  }
}
