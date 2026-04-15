const buckets = new Map<string, { count: number; reset: number }>();

/** Simple in-memory fixed window limiter for serverless dev/single instance. Swap for Redis in production. */
export function checkRateLimit(key: string, max: number, windowMs: number): { ok: boolean } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (b.count >= max) return { ok: false };
  b.count += 1;
  return { ok: true };
}
