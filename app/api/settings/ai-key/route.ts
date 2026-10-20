import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { encrypt, decrypt } from "@/lib/crypto";
import {
  listAiKeys,
  upsertAiKey,
  deleteAiKeyForProvider,
  deleteAllAiKeys,
} from "@/lib/db/users";
import { detectProvider, testAiKey } from "@/lib/ai";
import { AI_PROVIDERS, type AiProvider } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

export interface AiKeySummary {
  provider: AiProvider;
  status: "valid" | "invalid";
  hint: string | null;
}

function keyHint(key: string): string {
  if (key.length < 12) return "…";
  return `${key.slice(0, 3)}…${key.slice(-4)}`;
}

async function summarizeKeys(): Promise<AiKeySummary[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const rows = await listAiKeys(userId);
  return rows
    .filter((row): row is typeof row & { provider: AiProvider } =>
      AI_PROVIDERS.includes(row.provider as AiProvider),
    )
    .map((row) => {
      let hint = row.keyHint;
      if (!hint && row.encryptedKey) {
        try {
          hint = keyHint(decrypt(row.encryptedKey));
        } catch {
          hint = null;
        }
      }
      return {
        provider: row.provider as AiProvider,
        status: row.status === "invalid" ? "invalid" : "valid",
        hint,
      };
    });
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await summarizeKeys();
    const latest = keys[0] ?? null;

    return NextResponse.json({
      provider: latest?.provider ?? null,
      hasKey: keys.length > 0,
      keys,
    });
  } catch (error) {
    console.error("Error fetching AI key status:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI key status" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // POST triggers a paid provider call (testAiKey) — keep it cheap to spam.
    const rateCheck = checkRateLimit(`ai-key:${userId}`, 10);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)),
          },
        },
      );
    }

    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      );
    }

    const trimmedKey = key.trim();
    const provider = detectProvider(trimmedKey);
    if (!provider) {
      return NextResponse.json(
        {
          error:
            "Unrecognized API key format. Supported: OpenAI (sk-...), OpenRouter (sk-or-v1-...), Anthropic (sk-ant-...), Google (AIza...).",
        },
        { status: 400 },
      );
    }

    const valid = await testAiKey(trimmedKey, provider);
    if (!valid) {
      return NextResponse.json(
        {
          error: `API key is invalid or the ${provider} service is unreachable.`,
        },
        { status: 400 },
      );
    }

    await upsertAiKey(
      userId,
      provider,
      encrypt(trimmedKey),
      keyHint(trimmedKey),
    );

    const providerName =
      provider === "openrouter"
        ? "OpenRouter"
        : provider === "anthropic"
          ? "Anthropic"
          : provider === "google"
            ? "Google"
            : "OpenAI";

    return NextResponse.json({
      success: true,
      provider,
      hint: keyHint(trimmedKey),
      keys: await summarizeKeys(),
      message: `Connected to ${providerName}.`,
    });
  } catch (error) {
    // Never echo raw error text here — env misconfig details ("Invalid key
    // length", file paths) must not reach the client.
    console.error("Error saving AI key:", error);
    return NextResponse.json(
      { error: "Failed to save API key" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = new URL(request.url).searchParams;
    const providerParam = params.get("provider");
    const wantsAll = params.get("all") === "true";

    // Bulk delete is explicit (`?all=true`); an unrecognized provider is a
    // 400 — never silently fall through to wiping every key.
    if (wantsAll && !providerParam) {
      await deleteAllAiKeys(userId);
      return NextResponse.json({ success: true, keys: await summarizeKeys() });
    }

    if (providerParam && AI_PROVIDERS.includes(providerParam as AiProvider)) {
      await deleteAiKeyForProvider(userId, providerParam as AiProvider);
      return NextResponse.json({ success: true, keys: await summarizeKeys() });
    }

    return NextResponse.json(
      {
        error:
          "Specify a valid provider (openai, anthropic, openrouter , google) or pass all=true.",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error deleting AI key:", error);
    return NextResponse.json(
      { error: "Failed to delete AI key" },
      { status: 500 },
    );
  }
}
