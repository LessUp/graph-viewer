#!/usr/bin/env node
const target = process.argv[2] || process.env.APP_URL || 'http://localhost:3000';
async function check(path, opts) {
  const res = await fetch(`${target}${path}`, opts);
  const ok = res.ok;
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  return { ok, status: res.status, data, contentType };
}
async function main() {
  const results = [];
  results.push(['healthz', await check('/api/healthz')]);
  const payload = (engine, format, code) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ engine, format, code }) });
  const sample = 'flowchart TD\nA[Start] --> B{Is it?}\nB -- Yes --> C[OK]\nB -- No --> D[End]';
  results.push(['render-svg', await check('/api/render', payload('mermaid', 'svg', sample))]);
  results.push(['render-png', await check('/api/render', payload('mermaid', 'png', sample))]);
  let failed = false;
  for (const [name, r] of results) {
    const pass = r.ok;
    if (!pass) failed = true;
    console.log(`${name}: ${pass ? 'PASS' : 'FAIL'} (${r.status})`);
  }
  process.exit(failed ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });