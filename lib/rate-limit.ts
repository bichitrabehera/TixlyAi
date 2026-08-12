import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_CLEANUP_INTERVAL_MS } from "./constants";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = RATE_LIMIT_WINDOW_MS;
const MAX_REQUESTS = 1;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL_MS);

export function checkRateLimit(
  key: string,
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();

  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  const resetIn = entry.resetAt - now;

  return {
    allowed: entry.count <= MAX_REQUESTS,
    remaining,
    resetIn,
  };
}
