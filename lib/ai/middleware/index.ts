import {
  modelCallLimitMiddleware,
  modelRetryMiddleware,
  piiMiddleware,
} from "langchain";
import { AGENT_LIMITS } from "../config";
import { isAuthModelError } from "../errors";
import { inputGuardrailMiddleware, GuardrailViolationError } from "./input-guardrail";
import { observabilityMiddleware } from "./observability";
import { outputGuardrailMiddleware } from "./output-guardrail";

export { GuardrailViolationError };

/**
 * The full harness middleware stack, in execution order:
 *
 * 1. input-guardrails   — validate/block unsafe or empty input (custom)
 * 2. run-observability  — record model/tool/guardrail trail (custom)
 * 3. model-retry        — back off on transient failures only; auth errors
 *                         are never retried, and failures re-throw instead of
 *                         injecting provider error text into the conversation
 * 4. model-call-limit   — cap model calls per run so cost can't run away (built-in)
 * 5. pii-mask           — mask credit-card-like numbers in user text (built-in)
 * 6. output-guardrails  — business-rule checks, force human review on issues (custom)
 */
export function buildAgentMiddleware() {
  return [
    inputGuardrailMiddleware(),
    observabilityMiddleware(),
    modelRetryMiddleware({
      maxRetries: AGENT_LIMITS.modelRetryMax,
      retryOn: (error: Error) => !isAuthModelError(error),
      onFailure: "error",
    }),
    modelCallLimitMiddleware({
      runLimit: AGENT_LIMITS.modelCallRunLimit,
      exitBehavior: "end",
    }),
    piiMiddleware("credit_card", {
      strategy: "mask",
      applyToInput: true,
    }),
    outputGuardrailMiddleware(),
  ];
}
