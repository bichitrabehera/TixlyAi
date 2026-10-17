export const AI_PROVIDERS = ["openai", "openrouter", "anthropic"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];
export const LINEAR_API_URL = "https://api.linear.app/graphql";
export const SLACK_API_BASE = "https://slack.com/api";
export const IMAGEKIT_UPLOAD_URL =
  "https://upload.imagekit.io/api/v1/files/upload";

export const TICKET_HISTORY_PAGE_SIZE = 50;
export const TICKET_TITLE_TRUNCATE_LENGTH = 60;
export const TICKET_TITLE_MAX_LENGTH = 80;
export const LINEAR_TITLE_MAX_LENGTH = 255;
export const LINEAR_DESCRIPTION_MAX_LENGTH = 5000;
export const TEXTAREA_MAX_HEIGHT = 200;
export const TEXTAREA_MIN_HEIGHT = 52;

export const TOAST_DISMISS_MS = 2000;

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 5;
export const RATE_LIMIT_CLEANUP_INTERVAL_MS = 60_000;

export const TICKET_TYPES = ["bug", "feature", "ui", "feedback", "task"] as const;
export type TicketType = (typeof TICKET_TYPES)[number];

export const TICKET_TYPE_META: Record<
  TicketType,
  { label: string; emoji: string; description: string }
> = {
  bug: {
    label: "Bug Report",
    emoji: "🐛",
    description: "Something is broken or not working as expected.",
  },
  feature: {
    label: "Feature Request",
    emoji: "✨",
    description: "A new capability or enhancement to build.",
  },
  ui: {
    label: "UI Issue",
    emoji: "🎨",
    description: "A visual or layout problem in the interface.",
  },
  feedback: {
    label: "Client Feedback",
    emoji: "💬",
    description: "Feedback or opinions from a client or user.",
  },
  task: {
    label: "Task",
    emoji: "⚡",
    description: "A discrete piece of work to be completed.",
  },
};

export const DETAIL_LEVELS = ["concise", "standard", "detailed"] as const;

export const DETAIL_LEVEL_META: Record<
  (typeof DETAIL_LEVELS)[number],
  { label: string; hint: string }
> = {
  concise: { label: "Concise", hint: "Title, description, priority only." },
  standard: {
    label: "Standard",
    hint: "Adds repro steps, expected vs. actual, and component.",
  },
  detailed: {
    label: "Detailed",
    hint: "Full technical context, edge cases, and acceptance notes.",
  },
};

export const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export const TEMPERATURE_MAP: Record<string, number> = {
  CRITICAL: 0.0,
  HIGH: 0.1,
  MEDIUM: 0.3,
  LOW: 0.5,
};

export const SESSION_KEY = "tixly_session";
export const STORAGE_THEME_KEY = "theme";
export const PREFS_STORAGE_KEY = "tixly_prefs";
export const MODEL_STORAGE_KEY = "tixly_model";

export const PROVIDER_LABELS: Record<AiProvider, string> = {
  openai: "OpenAI",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
};

export const PROVIDER_MODEL_LABEL: Record<AiProvider, string> = {
  openai: "GPT-4o",
  openrouter: "OpenRouter Auto",
  anthropic: "Claude Sonnet 4",
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;
export const ALLOWED_IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp", ".heic", ".heif"];

export const OCR_LANGUAGE = "eng";
export const SLACK_OAUTH_SCOPES = "chat:write,im:write,im:read,users:read";
