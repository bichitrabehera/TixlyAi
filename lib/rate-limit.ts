import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_TIERS, RATE_LIMIT_CLEANUP_INTERVAL_MS } from "./constants";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = RATE_LIMIT_WINDOW_MS;

const LIMITS = RATE_LIMIT_TIERS;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL_MS);

export function checkRateLimit(
  userId: string,
  plan: string = "free",
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = `${plan}:${userId}`;
  const limit = LIMITS[plan] || LIMITS.free;

  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  const resetIn = entry.resetAt - now;

  return {
    allowed: entry.count <= limit,
    remaining,
    resetIn,
  };
}
