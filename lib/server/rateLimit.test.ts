import { beforeEach, describe, expect, it } from 'vitest';
import { checkRateLimit, pruneRateLimitCache, resetRateLimitForTests } from './rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it('tracks requests per client and reports remaining quota', () => {
    const first = checkRateLimit('127.0.0.1', { now: 1000, windowMs: 1000, maxRequests: 2 });
    const second = checkRateLimit('127.0.0.1', { now: 1100, windowMs: 1000, maxRequests: 2 });
    const third = checkRateLimit('127.0.0.1', { now: 1200, windowMs: 1000, maxRequests: 2 });

    expect(first).toMatchObject({ allowed: true, remaining: 1, resetAt: 2000 });
    expect(second).toMatchObject({ allowed: true, remaining: 0, resetAt: 2000 });
    expect(third).toMatchObject({ allowed: false, remaining: 0, resetAt: 2000 });
  });

  it('starts a new window after expiry', () => {
    checkRateLimit('127.0.0.1', { now: 1000, windowMs: 1000, maxRequests: 1 });

    const next = checkRateLimit('127.0.0.1', { now: 2001, windowMs: 1000, maxRequests: 1 });

    expect(next).toMatchObject({ allowed: true, remaining: 0, resetAt: 3001 });
  });

  it('prunes expired entries explicitly without relying on a route-level timer', () => {
    checkRateLimit('expired', { now: 1000, windowMs: 1000, maxRequests: 1 });
    checkRateLimit('fresh', { now: 2500, windowMs: 1000, maxRequests: 1 });

    const removed = pruneRateLimitCache(2501);

    expect(removed).toBe(1);
    expect(checkRateLimit('expired', { now: 2501, windowMs: 1000, maxRequests: 1 })).toMatchObject({
      allowed: true,
      resetAt: 3501,
    });
    expect(checkRateLimit('fresh', { now: 2501, windowMs: 1000, maxRequests: 1 })).toMatchObject({
      allowed: false,
      resetAt: 3500,
    });
  });
});
