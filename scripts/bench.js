#!/usr/bin/env node
const target = process.env.APP_URL || 'http://localhost:3000';
const N = parseInt(process.env.N || '20', 10);
const payload = (engine, format, code, binary=false) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ engine, format, code, binary }) });
const sample = 'flowchart TD\nA[Start] --> B{Is it?}\nB -- Yes --> C[OK]\nB -- No --> D[End]';
async function benchOnce(format) {
  const t0 = Date.now();
  const res = await fetch(`${target}/api/render`, payload('mermaid', format, sample));
  const t1 = Date.now();
  return { ok: res.ok, ms: t1 - t0 };
}
async function main() {
  const stats = { svg: [], png: [] };
  for (let i = 0; i < N; i++) {
    stats.svg.push(await benchOnce('svg'));
    stats.png.push(await benchOnce('png'));
  }
  function summarize(arr) {
    const a = arr.filter(x => x.ok).map(x => x.ms);
    const avg = a.reduce((s, v) => s + v, 0) / (a.length || 1);
    const p95 = a.sort((x,y)=>x-y)[Math.floor(0.95 * (a.length-1))] || 0;
    return { count: arr.length, ok: arr.filter(x=>x.ok).length, avg: Math.round(avg), p95: Math.round(p95) };
  }
  console.log('bench results', { svg: summarize(stats.svg), png: summarize(stats.png) });
}
main().catch((e) => { console.error(e); process.exit(1); });