#!/usr/bin/env node
const target = process.env.APP_URL || 'http://localhost:3000';
const N = parseInt(process.env.N || '20', 10);
const sample = 'flowchart TD\nA[Start] --> B{Is it?}\nB -- Yes --> C[OK]\nB -- No --> D[End]';

function makePayload(engine, format, code, binary = false) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine, format, code, binary }),
  };
}

async function benchOnce(format) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${target}/api/render`, makePayload('mermaid', format, sample));
    return { ok: res.ok, ms: Date.now() - t0 };
  } catch {
    return { ok: false, ms: Date.now() - t0 };
  }
}

function summarize(arr) {
  const a = arr.filter((x) => x.ok).map((x) => x.ms);
  const avg = a.reduce((s, v) => s + v, 0) / (a.length || 1);
  const sorted = [...a].sort((x, y) => x - y);
  const p95 = sorted[Math.floor(0.95 * (sorted.length - 1))] || 0;
  return {
    count: arr.length,
    ok: arr.filter((x) => x.ok).length,
    avg: Math.round(avg),
    p95: Math.round(p95),
  };
}

async function main() {
  console.log(`benchmarking ${target} (N=${N})`);
  const stats = { svg: [], png: [] };
  for (let i = 0; i < N; i++) {
    stats.svg.push(await benchOnce('svg'));
    stats.png.push(await benchOnce('png'));
  }
  console.log('bench results', {
    svg: summarize(stats.svg),
    png: summarize(stats.png),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
