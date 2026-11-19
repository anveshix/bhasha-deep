import { describe, expect, it, beforeEach } from 'vitest';
import { FixedWindowRateLimiter } from './rateLimiter';

describe('FixedWindowRateLimiter', () => {
  it('allows up to the limit then blocks', () => {
    const limiter = new FixedWindowRateLimiter({ limit: 3, windowMs: 1000 });
    expect(limiter.consume('ip', 0).allowed).toBe(true);
    expect(limiter.consume('ip', 0).allowed).toBe(true);
    expect(limiter.consume('ip', 0).allowed).toBe(true);

    const blocked = limiter.consume('ip', 0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets after the window elapses', () => {
    const limiter = new FixedWindowRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.consume('ip', 0).allowed).toBe(true);
    expect(limiter.consume('ip', 500).allowed).toBe(false);
    expect(limiter.consume('ip', 1001).allowed).toBe(true);
  });

  it('isolates buckets per key', () => {
    const limiter = new FixedWindowRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.consume('a', 0).allowed).toBe(true);
    expect(limiter.consume('b', 0).allowed).toBe(true);
    expect(limiter.consume('a', 0).allowed).toBe(false);
  });

  it('sweeps expired buckets so the map cannot grow unbounded', () => {
    const limiter = new FixedWindowRateLimiter({ limit: 1, windowMs: 100 });
    for (let i = 0; i < 50; i++) limiter.consume(`ip-${i}`, 0);
    expect(limiter.size).toBe(50);
    limiter.consume('fresh', 5000);
    expect(limiter.size).toBeLessThan(50);
  });
});
