import {
  MAX_NOTE_LENGTH,
  MAX_OCR_TEXT_LENGTH,
  TEMPERATURE_MAP,
  type AiProvider,
} from "@/lib/constants";

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Per-provider model configuration. `AI_MODEL_CONFIG` holds the default
 * (seed) model used when the user hasn't picked one; `MODEL_CATALOG` is the
 * curated list the Generate-screen picker offers. The server honors a
 * client-supplied `model` from this catalog — the default is only a fallback.
 */
export const AI_MODEL_CONFIG: Record<
  AiProvider,
  { model: string; baseURL?: string }
> = {
  openai: { model: "gpt-4o" },
  anthropic: { model: "claude-sonnet-4-20250514" },
  openrouter: { model: "openrouter/auto", baseURL: OPENROUTER_BASE_URL },
  google: { model: "gemini-2.0-flash" },
};

export interface CatalogModel {
  id: string;
  label: string;
  vision: boolean;
  fast?: boolean;
  quality?: boolean;
}

export const MODEL_CATALOG: Record<AiProvider, CatalogModel[]> = {
  openai: [
    { id: "gpt-4o", label: "GPT-4o", vision: true, quality: true },
    { id: "gpt-4o-mini", label: "GPT-4o Mini", vision: true, fast: true },
    { id: "gpt-4.1", label: "GPT-4.1", vision: true, quality: true },
    { id: "o3", label: "o3", vision: true, quality: true },
    { id: "o4-mini", label: "o4 Mini", vision: true, fast: true },
  ],
  anthropic: [
    {
      id: "claude-sonnet-4-20250514",
      label: "Claude Sonnet 4",
      vision: true,
      quality: true,
    },
    {
      id: "claude-opus-4-20250514",
      label: "Claude Opus 4",
      vision: true,
      quality: true,
    },
    {
      id: "claude-3-5-haiku-20241022",
      label: "Claude 3.5 Haiku",
      vision: true,
      fast: true,
    },
  ],
  openrouter: [
    { id: "openrouter/auto", label: "Auto (best fit)", vision: true },
    { id: "openai/gpt-4o", label: "GPT-4o", vision: true, quality: true },
    {
      id: "anthropic/claude-sonnet-4",
      label: "Claude Sonnet 4",
      vision: true,
      quality: true,
    },
    {
      id: "google/gemini-2.0-flash-001",
      label: "Gemini 2.0 Flash",
      vision: true,
      fast: true,
    },
  ],
  google: [
    {
      id: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      vision: true,
      fast: true,
    },
    {
      id: "gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      vision: true,
      fast: true,
    },
    {
      id: "gemini-2.5-pro",
      label: "Gemini 2.5 Pro",
      vision: true,
      quality: true,
    },
  ],
};

export function defaultModelFor(provider: AiProvider): string {
  return MODEL_CATALOG[provider][0]?.id ?? AI_MODEL_CONFIG[provider].model;
}

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
  validateOutput: {
    id: "validate_output",
    label: "Validating structured output",
  },
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
