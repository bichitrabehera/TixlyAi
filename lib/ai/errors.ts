/**
 * Shared error classification for the AI run path.
 *
 * Provider SDKs word auth failures differently per release, so this is a
 * best-effort signal — it gates (a) whether the model-retry middleware
 * should spend retries on an error, (b) whether the vision→text fallback
 * may start a second run, and (c) whether the stored key is marked invalid.
 * False positives only cost a friendly error message; false negatives only
 * cost one wasted retry, so the pattern errs toward matching auth wording.
 */
const AUTH_ERROR_PATTERN =
  /api[\s_-]?key|unauthorized|authentication|permission|forbidden|invalid[\s_-]?x-api-key|incorrect api key|\b401\b|\b403\b/i;

/**
 * The run ended without a structured ticket — the model-call budget ran out,
 * schema-validation retries were exhausted, or the model replied with prose.
 * Never eligible for the vision→text fallback (it would buy a fresh
 * model-call budget for the same failure).
 */
export class NoStructuredOutputError extends Error {
  constructor(
    message = "The agent finished without producing a structured ticket.",
  ) {
    super(message);
    this.name = "NoStructuredOutputError";
  }
}

/** True when the error looks like the provider rejecting the user's key. */
export function isAuthModelError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return AUTH_ERROR_PATTERN.test(message);
}

/** Fixed, client-safe message for unexpected run failures. */
export const RUN_FAILED_MESSAGE =
  "Something went wrong while generating the ticket. Please try again.";
