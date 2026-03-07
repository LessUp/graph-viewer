import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/healthz/route';

describe('GET /api/healthz', () => {
  it('returns ok status payload', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
