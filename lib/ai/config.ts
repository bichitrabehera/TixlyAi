import {
  MAX_NOTE_LENGTH,
  MAX_OCR_TEXT_LENGTH,
  TEMPERATURE_MAP,
  type AiProvider,
} from "@/lib/constants";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * The model is fixed per provider — the app is locked to each provider's
 * configured model (OpenAI = gpt-4o). The UI no longer exposes a picker, and
 * the server ignores any client-supplied model so a stale stored selection
 * can never change what actually runs.
 */
export const AI_MODEL_CONFIG: Record<
  AiProvider,
  { model: string; baseURL?: string }
> = {
  openai: { model: "gpt-4o" },
  anthropic: { model: "claude-sonnet-4-20250514" },
  openrouter: { model: "openrouter/auto", baseURL: OPENROUTER_BASE_URL },
};

export const AGENT_LIMITS = {
  maxNoteLength: MAX_NOTE_LENGTH,
  maxOcrLength: MAX_OCR_TEXT_LENGTH,
  modelCallRunLimit: 6,
  modelRetryMax: 2,
  graphRecursionLimit: 100,
} as const;

export const RUN_STEPS = {
  validate: { id: "validate", label: "Validating input" },
  analyze: { id: "analyze", label: "Analyzing screenshot" },
  tools: { id: "tools", label: "Cross-checking references" },
  draft: { id: "draft", label: "Drafting ticket" },
  validateOutput: { id: "validate_output", label: "Validating structured output" },
  fallback: { id: "fallback", label: "Retrying without image" },
} as const;

export function temperatureFor(preferredPriority?: string): number {
  if (!preferredPriority) return 0.3;
  return TEMPERATURE_MAP[preferredPriority] ?? 0.3;
}

/**
 * Client-side heuristic for whether a model accepts images.
 * The client can override it per-request via `modelVision` (from the
 * /api/ai/models catalog); this is the fallback when it's absent.
 */
export function modelVisionHeuristic(
  provider: AiProvider,
  model: string,
): boolean {
  if (provider === "openai") {
    return /^(gpt-4o|gpt-4\.1|gpt-4-turbo|gpt-4-vision|gpt-5|o1|o3|o4)/.test(
      model,
    );
  }
  if (provider === "anthropic") {
    return /^claude-(?!2|instant)/.test(model);
  }
  return true;
}
