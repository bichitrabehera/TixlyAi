import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { decrypt } from "@/lib/crypto";
import { listAiKeys, setAiKeyStatus } from "@/lib/db/users";
import { AI_PROVIDERS, type AiProvider } from "@/lib/constants";
import { AI_MODEL_CONFIG, modelVisionHeuristic } from "@/lib/ai/config";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export interface ProviderModelsResult {
  provider: AiProvider;
  status: "valid" | "invalid" | "missing";
  models: Array<{ id: string; vision: boolean; fast?: boolean; quality?: boolean }>;
}

const OPENAI_BASE = "https://api.openai.com/v1";
const ANTHROPIC_BASE = "https://api.anthropic.com/v1";
const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const GOOGLE_BASE = "https://generativelanguage.googleapis.com/v1beta";
const ANTHROPIC_VERSION = "2023-06-01";

const FAST_RE = /(mini|haiku|flash|lite|instant|small|nano|micro|auto)/;
const QUALITY_RE = /(opus|sonnet|gpt-5|gpt-4\.1|\bo3\b|\bo4\b|pro\b|r1)/;

function hintFor(id: string) {
  return {
    fast: FAST_RE.test(id),
    quality: QUALITY_RE.test(id),
  };
}

function withSeed(
  provider: AiProvider,
  models: ProviderModelsResult["models"],
): ProviderModelsResult["models"] {
  const seed = AI_MODEL_CONFIG[provider].model;
  if (models.some((m) => m.id === seed)) return models;
  const vision =
    provider === "openrouter"
      ? seed === "openrouter/auto"
      : modelVisionHeuristic(provider, seed);
  return [{ id: seed, vision, ...hintFor(seed) }, ...models];
}

function isOpenAiChatModel(id: string): boolean {
  return !/^(text-embedding|dall-e|whisper|tts|davinci|babbage|curie|gpt-image|omni-moderation|moderation|search|transcribe|audio)/.test(
    id,
  );
}

async function fetchJson(url: string, headers: HeadersInit) {
  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  return res;
}

async function listOpenAiModels(key: string) {
  const res = await fetchJson(`${OPENAI_BASE}/models`, {
    Authorization: `Bearer ${key}`,
  });
  if (res.status === 401 || res.status === 403) return { unauthorized: true, models: [] };
  if (!res.ok) return { unauthorized: false, models: [] };
  const data = (await res.json()) as { data?: Array<{ id: string }> };
  const models = (data.data ?? [])
    .map((m) => m.id)
    .filter(isOpenAiChatModel)
    .sort()
    .map((id) => ({ id, vision: modelVisionHeuristic("openai", id), ...hintFor(id) }));
  return { unauthorized: false, models };
}

async function listAnthropicModels(key: string) {
  const res = await fetchJson(`${ANTHROPIC_BASE}/models`, {
    "x-api-key": key,
    "anthropic-version": ANTHROPIC_VERSION,
  });
  if (res.status === 401 || res.status === 403) return { unauthorized: true, models: [] };
  if (!res.ok) return { unauthorized: false, models: [] };
  const data = (await res.json()) as { data?: Array<{ id: string }> };
  const models = (data.data ?? [])
    .map((m) => m.id)
    .sort()
    .map((id) => ({
      id,
      vision: modelVisionHeuristic("anthropic", id),
      ...hintFor(id),
    }));
  return { unauthorized: false, models };
}

async function listOpenRouterModels(key?: string) {
  const res = await fetchJson(`${OPENROUTER_BASE}/models`, {
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  });
  if (res.status === 401 || res.status === 403) return { unauthorized: true, models: [] };
  if (!res.ok) return { unauthorized: false, models: [] };
  const data = (await res.json()) as {
    data?: Array<{
      id: string;
      architecture?: { input_modalities?: string[] } | null;
    }>;
  };
  const models = (data.data ?? [])
    .map((m) => m.id)
    .sort()
    .map((id) => ({
      id,
      vision:
        id === "openrouter/auto" ||
        Boolean(
          (data.data ?? [])
            .find((m) => m.id === id)
            ?.architecture?.input_modalities?.includes("image"),
        ),
      ...hintFor(id),
    }));
  return { unauthorized: false, models };
}

async function listGoogleModels(key: string) {
  const res = await fetchJson(`${GOOGLE_BASE}/models?key=${encodeURIComponent(key)}`, {});
  if (res.status === 401 || res.status === 403) return { unauthorized: true, models: [] };
  if (!res.ok) return { unauthorized: false, models: [] };
  const data = (await res.json()) as {
    models?: Array<{
      name?: string;
      supportedGenerationMethods?: string[];
    }>;
  };
  const models = (data.models ?? [])
    .map((m) => (m.name ?? "").replace(/^models\//, ""))
    .filter((id) => id.startsWith("gemini-") && !id.includes("embedding"))
    .sort()
    .map((id) => ({
      id,
      vision: /flash|pro/i.test(id),
      ...hintFor(id),
    }));
  return { unauthorized: false, models };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This route decrypts stored keys and makes up to three outbound provider
    // calls per request — keep it cheap to spam.
    const rateCheck = checkRateLimit(`ai-models:${userId}`, 30);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)) },
        },
      );
    }

    const rows = await listAiKeys(userId);
    const results: ProviderModelsResult[] = [];

    for (const provider of AI_PROVIDERS) {
      const row = rows.find((r) => r.provider === provider);

      if (!row) {
        results.push({ provider, status: "missing", models: [] });
        continue;
      }

      let key: string;
      try {
        key = decrypt(row.encryptedKey);
      } catch {
        results.push({ provider, status: "invalid", models: [] });
        setAiKeyStatus(userId, provider, "invalid").catch(() => {});
        continue;
      }

      let outcome: { unauthorized: boolean; models: ProviderModelsResult["models"] };
      try {
        if (provider === "openai") outcome = await listOpenAiModels(key);
        else if (provider === "anthropic") outcome = await listAnthropicModels(key);
        else if (provider === "google") outcome = await listGoogleModels(key);
        else outcome = await listOpenRouterModels(key);
      } catch {
        // Network/timeout — keep the stored status, just no models this round.
        results.push({
          provider,
          status: row.status === "invalid" ? "invalid" : "valid",
          models: [],
        });
        continue;
      }

      const status: "valid" | "invalid" = outcome.unauthorized ? "invalid" : "valid";
      if (status !== row.status) setAiKeyStatus(userId, provider, status).catch(() => {});

      results.push({ provider, status, models: withSeed(provider, outcome.models) });
    }

    return NextResponse.json(
      { providers: results },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error listing models:", error);
    return NextResponse.json(
      { error: "Failed to list models" },
      { status: 500 },
    );
  }
}
