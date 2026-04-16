import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/healthz/route';

describe('GET /api/healthz', () => {
  it('returns ok status payload with required fields', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();

    // 验证必需字段存在
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
    expect(data.version).toBeDefined();
    expect(data.checks).toBeDefined();
    expect(data.checks.kroki).toBeDefined();
    expect(['ok', 'error']).toContain(data.checks.kroki.status);
  });

  it('returns valid timestamp format', async () => {
    const response = await GET();
    const data = await response.json();

    // 验证时间戳是有效的 ISO 格式
    const timestamp = new Date(data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });
});
