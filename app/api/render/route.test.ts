import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/render/route';

const fetchMock = vi.spyOn(globalThis, 'fetch');

function createRequest(body: unknown) {
  return new Request('http://localhost/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/render', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.stubEnv('KROKI_BASE_URL', 'https://kroki.io');
    vi.stubEnv('KROKI_ALLOW_CLIENT_BASE_URL', 'false');
    vi.stubEnv('KROKI_CLIENT_BASE_URL_ALLOWLIST', 'https://kroki.example.com');
  });

  it('rejects invalid request bodies', async () => {
    const request = new Request('http://localhost/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'null',
    });

    const response = await POST(request as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'INVALID_BODY' });
  });

  it('rejects requests with missing required fields', async () => {
    const response = await POST(createRequest({ engine: 'mermaid', code: 'graph TD\nA-->B' }) as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'MISSING_FIELDS' });
  });

  it('rejects unsupported engine values', async () => {
    const response = await POST(createRequest({ engine: 'bad', format: 'svg', code: 'x' }) as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'UNSUPPORTED_ENGINE' });
  });

  it('rejects unsupported format values', async () => {
    const response = await POST(createRequest({ engine: 'mermaid', format: 'jpg', code: 'x' }) as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'UNSUPPORTED_FORMAT' });
  });

  it('rejects payloads that exceed the max code length', async () => {
    const response = await POST(
      createRequest({ engine: 'mermaid', format: 'svg', code: 'a'.repeat(100001) }) as never,
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      code: 'PAYLOAD_TOO_LARGE',
      maxLength: 100000,
    });
  });

  it('rejects invalid custom kroki urls', async () => {
    const response = await POST(
      createRequest({
        engine: 'mermaid',
        format: 'svg',
        code: 'graph TD\nA-->B',
        krokiBaseUrl: 'javascript:alert(1)',
      }) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'INVALID_KROKI_BASE_URL' });
  });

  it('rejects non-allowlisted custom kroki urls', async () => {
    const response = await POST(
      createRequest({
        engine: 'mermaid',
        format: 'svg',
        code: 'graph TD\nA-->B',
        krokiBaseUrl: 'https://blocked.example.com',
      }) as never,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'KROKI_BASE_URL_NOT_ALLOWED' });
  });

  it('returns svg payload and reuses inflight fetches for identical requests', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<svg>ok</svg>', {
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
      }),
    );

    const req = createRequest({
      engine: 'mermaid',
      format: 'svg',
      code: 'graph TD\nA-->B\nDedupeCase',
    });

    const [first, second] = await Promise.all([POST(req.clone() as never), POST(req.clone() as never)]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(first.json()).resolves.toMatchObject({ svg: '<svg>ok</svg>' });
    await expect(second.json()).resolves.toMatchObject({ svg: '<svg>ok</svg>' });
  }, 10000);

  it('returns cached svg payload for repeated requests', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('<svg>cached</svg>', {
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
      }),
    );

    const body = { engine: 'mermaid', format: 'svg', code: 'graph TD\nA-->B\nCacheCase' };

    const first = await POST(createRequest(body) as never);
    const second = await POST(createRequest(body) as never);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    await expect(first.json()).resolves.toMatchObject({ svg: '<svg>cached</svg>' });
    await expect(second.json()).resolves.toMatchObject({ svg: '<svg>cached</svg>' });
  });

  it('returns base64 payload for png responses', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(Uint8Array.from([1, 2, 3, 4]), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      }),
    );

    const response = await POST(
      createRequest({ engine: 'mermaid', format: 'png', code: 'graph TD\nA-->B\nPngCase' }) as never,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      contentType: 'image/png',
      base64: 'AQIDBA==',
    });
  });

  it('returns binary responses when requested', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(Uint8Array.from([7, 8, 9]), {
        status: 200,
        headers: { 'content-type': 'application/pdf' },
      }),
    );

    const response = await POST(
      createRequest({ engine: 'plantuml', format: 'pdf', code: '@startuml', binary: true }) as never,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain('diagram.pdf');
    const buffer = new Uint8Array(await response.arrayBuffer());
    expect(Array.from(buffer)).toEqual([7, 8, 9]);
  });

  it('maps upstream timeout errors to a 504 response', async () => {
    fetchMock.mockImplementationOnce(async () => {
      throw Object.assign(new Error('aborted'), { name: 'AbortError' });
    });

    const response = await POST(
      createRequest({ engine: 'mermaid', format: 'svg', code: 'graph TD\nA-->B\nTimeoutCase' }) as never,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toMatchObject({ code: 'KROKI_TIMEOUT' });
  }, 10000);

  it('maps upstream network errors to a 502 response', async () => {
    fetchMock.mockImplementationOnce(async () => {
      throw new Error('network down');
    });

    const response = await POST(
      createRequest({ engine: 'mermaid', format: 'svg', code: 'graph TD\nA-->B\nNetworkCase' }) as never,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      code: 'KROKI_NETWORK_ERROR',
      message: 'network down',
    });
  });

  it('maps upstream render errors to a 502 response', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('syntax error', {
        status: 400,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const response = await POST(
      createRequest({ engine: 'mermaid', format: 'svg', code: 'graph TD\nBroken' }) as never,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      code: 'KROKI_ERROR',
      status: 400,
      details: 'syntax error',
    });
  });

  it('rejects invalid server configuration', async () => {
    vi.stubEnv('KROKI_BASE_URL', 'javascript:bad');

    const response = await POST(
      createRequest({ engine: 'mermaid', format: 'svg', code: 'graph TD\nA-->B\nConfigCase' }) as never,
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ code: 'INVALID_KROKI_CONFIG' });
  });
});
