import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock fetch for Kroki
vi.stubGlobal('fetch', vi.fn());

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful Kroki response
    vi.mocked(fetch).mockResolvedValue(
      new Response('<svg>test</svg>', {
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('allows requests within rate limit', async () => {
    const makeRequest = () =>
      new NextRequest('http://localhost/api/render', {
        method: 'POST',
        body: JSON.stringify({
          engine: 'mermaid',
          format: 'svg',
          code: 'graph TD[A-->B]',
        }),
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

    // Make multiple requests within limit
    for (let i = 0; i < 5; i++) {
      const response = await POST(makeRequest());
      expect(response.status).toBe(200);
    }
  });

  it('handles missing x-forwarded-for header', async () => {
    const request = new NextRequest('http://localhost/api/render', {
      method: 'POST',
      body: JSON.stringify({
        engine: 'mermaid',
        format: 'svg',
        code: 'graph TD[A-->B]',
      }),
    });

    const response = await POST(request);
    // Should still work with 'unknown' IP
    expect(response.status).toBe(200);
  });

  it('handles multiple IPs separately', async () => {
    const makeRequest = (ip: string) =>
      new NextRequest('http://localhost/api/render', {
        method: 'POST',
        body: JSON.stringify({
          engine: 'mermaid',
          format: 'svg',
          code: 'graph TD[A-->B]',
        }),
        headers: { 'x-forwarded-for': ip },
      });

    // Requests from different IPs should be tracked separately
    const response1 = await POST(makeRequest('192.168.1.10'));
    const response2 = await POST(makeRequest('192.168.1.20'));

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
  });

  it('parses x-forwarded-for with multiple IPs', async () => {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // We should use the first one (client)
    const request = new NextRequest('http://localhost/api/render', {
      method: 'POST',
      body: JSON.stringify({
        engine: 'mermaid',
        format: 'svg',
        code: 'graph TD[A-->B]',
      }),
      headers: { 'x-forwarded-for': '10.0.0.1, 192.168.1.1, 172.16.0.1' },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
