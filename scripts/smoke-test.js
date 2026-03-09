#!/usr/bin/env node
const target = process.argv[2] || process.env.APP_URL || 'http://localhost:3000';

function makePayload(engine, format, code) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engine, format, code }),
  };
}

async function check(path, opts) {
  const res = await fetch(`${target}${path}`, opts);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();
  return { ok: res.ok, status: res.status, data, contentType };
}

async function main() {
  const sample =
    'flowchart TD\nA[Start] --> B{Is it?}\nB -- Yes --> C[OK]\nB -- No --> D[End]';

  const results = [];
  results.push(['healthz', await check('/api/healthz')]);
  results.push([
    'render-svg',
    await check('/api/render', makePayload('mermaid', 'svg', sample)),
  ]);
  results.push([
    'render-png',
    await check('/api/render', makePayload('mermaid', 'png', sample)),
  ]);

  let failed = false;
  for (const [name, r] of results) {
    const pass = r.ok;
    if (!pass) {
      failed = true;
      console.log(`${name}: FAIL (${r.status})`, r.data);
    } else {
      console.log(`${name}: PASS (${r.status})`);
    }
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
