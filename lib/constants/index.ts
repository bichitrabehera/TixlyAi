export const DAILY_LIMIT = 5;

export const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
export const OPENAI_MODEL = "gpt-4o-mini";
export const OPENAI_API_KEY_PATTERN = /^sk-[A-Za-z0-9-_]{20,}$/;
export const LINEAR_API_URL = "https://api.linear.app/graphql";
export const SLACK_API_BASE = "https://slack.com/api";
export const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

export const TICKET_HISTORY_PAGE_SIZE = 50;
export const TICKET_TITLE_TRUNCATE_LENGTH = 60;
export const TICKET_TITLE_MAX_LENGTH = 80;
export const LINEAR_TITLE_MAX_LENGTH = 255;
export const LINEAR_DESCRIPTION_MAX_LENGTH = 5000;
export const TEXTAREA_MAX_HEIGHT = 200;
export const TEXTAREA_MIN_HEIGHT = 52;

export const TOAST_DISMISS_MS = 2000;

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_TIERS: Record<string, number> = { free: 5, basic: 30 };
export const RATE_LIMIT_CLEANUP_INTERVAL_MS = 60_000;

export const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export const TEMPERATURE_MAP: Record<string, number> = {
  CRITICAL: 0.0,
  HIGH: 0.1,
  MEDIUM: 0.3,
  LOW: 0.5,
};

export const SESSION_KEY = "tixly_session";
export const STORAGE_THEME_KEY = "theme";

export const OCR_LANGUAGE = "eng";
export const SLACK_OAUTH_SCOPES = "chat:write,im:write,im:read,users:read";
