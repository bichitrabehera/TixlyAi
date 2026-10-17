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

export interface AiKeySummary {
  provider: AiProvider;
  status: "valid" | "invalid";
  hint: string | null;
}

function keyHint(key: string): string {
  if (key.length <= 8) return `${key.slice(0, 2)}…`;
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

    const body = await request.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const trimmedKey = key.trim();
    const provider = detectProvider(trimmedKey);
    if (!provider) {
      return NextResponse.json(
        { error: "Unrecognized API key format. Supported: OpenAI (sk-...), OpenRouter (sk-or-v1-...), Anthropic (sk-ant-...)." },
        { status: 400 },
      );
    }

    const valid = await testAiKey(trimmedKey, provider);
    if (!valid) {
      return NextResponse.json(
        { error: `API key is invalid or the ${provider} service is unreachable.` },
        { status: 400 },
      );
    }

    await upsertAiKey(userId, provider, encrypt(trimmedKey), keyHint(trimmedKey));

    const providerName =
      provider === "openrouter"
        ? "OpenRouter"
        : provider === "anthropic"
          ? "Anthropic"
          : "OpenAI";

    return NextResponse.json({
      success: true,
      provider,
      hint: keyHint(trimmedKey),
      keys: await summarizeKeys(),
      message: `Connected to ${providerName}.`,
    });
  } catch (error) {
    console.error("Error saving AI key:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save API key" },
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

    const providerParam = new URL(request.url).searchParams.get("provider");
    const provider = providerParam as AiProvider | null;

    if (provider && AI_PROVIDERS.includes(provider)) {
      await deleteAiKeyForProvider(userId, provider);
    } else {
      await deleteAllAiKeys(userId);
    }

    return NextResponse.json({ success: true, keys: await summarizeKeys() });
  } catch (error) {
    console.error("Error deleting AI key:", error);
    return NextResponse.json(
      { error: "Failed to delete AI key" },
      { status: 500 },
    );
  }
}
