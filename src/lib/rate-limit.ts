/**
 * Rate limiter.
 *
 * A small fixed window limiter. Uses an in memory map by default, which is
 * fine for a single instance and for development. For multi instance
 * production, swap this for a Redis backed counter (seam left in place).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Above this many tracked keys we sweep out expired buckets on the next call.
// This bounds memory for the in-memory limiter without relying on a timer
// (timers are unreliable in serverless). Swap for Redis for multi-instance use.
const SWEEP_THRESHOLD = 5_000;

/** Drop expired buckets once the map grows past the threshold. */
function sweepExpired(now: number): void {
  if (buckets.size < SWEEP_THRESHOLD) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key      Unique key, for example `login:1.2.3.4`.
 * @param limit    Max requests allowed in the window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return { ok, remaining: Math.max(0, limit - existing.count), resetAt: existing.resetAt };
}

/** Best effort client IP from request headers. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip") || "0.0.0.0";
}
