import { APP_CONFIG } from '@/lib/config';

type RateLimitEntry = { count: number; resetAt: number };

type RateLimitOptions = {
  now?: number;
  windowMs?: number;
  maxRequests?: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

const rateLimitCache = new Map<string, RateLimitEntry>();

export function checkRateLimit(ip: string, options: RateLimitOptions = {}): RateLimitResult {
  const now = options.now ?? Date.now();
  const windowMs = options.windowMs ?? APP_CONFIG.rateLimit.windowMs;
  const maxRequests = options.maxRequests ?? APP_CONFIG.rateLimit.maxRequests;
  const entry = rateLimitCache.get(ip);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitCache.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function pruneRateLimitCache(now = Date.now()): number {
  let removed = 0;
  for (const [ip, entry] of rateLimitCache) {
    if (entry.resetAt < now) {
      rateLimitCache.delete(ip);
      removed++;
    }
  }
  return removed;
}

export function resetRateLimitForTests(): void {
  rateLimitCache.clear();
}
