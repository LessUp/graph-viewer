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

  it('rejects unsupported engine values', async () => {
    const response = await POST(createRequest({ engine: 'bad', format: 'svg', code: 'x' }) as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'UNSUPPORTED_ENGINE' });
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
});
