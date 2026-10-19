import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_CLEANUP_INTERVAL_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "./constants";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = RATE_LIMIT_WINDOW_MS;
const MAX_REQUESTS = RATE_LIMIT_MAX_REQUESTS;

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL_MS);
// Don't keep the process alive just for cleanup (scripts, dev HMR).
cleanupTimer.unref?.();

/**
 * Fixed-window per-key rate limit.
 *
 * NOTE: the store is per-process. On multi-instance or serverless deploys the
 * effective budget is `max × instances` and resets on restart — acceptable as
 * a cost tripwire today, but move to a shared store (Redis/Upstash) before
 * relying on it as a hard security boundary.
 *
 * @param key  namespaced key, e.g. `generate:${userId}`
 * @param max  optional per-route budget (defaults to the global limit)
 */
export function checkRateLimit(
  key: string,
  max: number = MAX_REQUESTS,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }

  entry.count++;
  const remaining = Math.max(0, max - entry.count);
  const resetIn = entry.resetAt - now;

  return {
    allowed: entry.count <= max,
    remaining,
    resetIn,
  };
}
