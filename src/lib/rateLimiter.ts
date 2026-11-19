/**
 * Minimal fixed-window rate limiter (no external dependency).
 *
 * Used by the server-side Gemini proxy in `server.ts` so a single browser (or
 * bot) cannot drain the deployment's API quota. Kept dependency-free and in
 * `src/lib` so it can be unit tested without booting Express.
 */

export interface RateLimitOptions {
  /** Maximum requests allowed inside one window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Milliseconds until the current window resets (used for Retry-After). */
  retryAfterMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private buckets = new Map<string, Bucket>();
  private readonly limit: number;
  private readonly windowMs: number;
  private lastSweep = 0;

  constructor({ limit, windowMs }: RateLimitOptions) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  consume(key: string, now = Date.now()): RateLimitResult {
    this.sweep(now);

    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      const resetAt = now + this.windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: this.limit - 1, retryAfterMs: this.windowMs };
    }

    if (existing.count >= this.limit) {
      return { allowed: false, remaining: 0, retryAfterMs: existing.resetAt - now };
    }

    existing.count += 1;
    return { allowed: true, remaining: this.limit - existing.count, retryAfterMs: existing.resetAt - now };
  }

  /** Drops expired buckets so the map cannot grow without bound. */
  private sweep(now: number): void {
    if (now - this.lastSweep < this.windowMs) return;
    this.lastSweep = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }

  get size(): number {
    return this.buckets.size;
  }
}
