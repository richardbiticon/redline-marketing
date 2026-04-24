// Per-IP in-memory rate limiter. Resets on cold start, which is fine for
// a small-volume booking endpoint. Upgrade to Vercel KV later if abuse shows up.
const hits = globalThis.__redlineRate || (globalThis.__redlineRate = new Map());

export function rateLimit(ip, limit = 5, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  hits.set(ip, entry);
  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
}
