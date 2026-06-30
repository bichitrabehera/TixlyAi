import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { encrypt } from "@/lib/crypto";
import { updateAiKey, deleteAiKey, getAiKey } from "@/lib/db/users";
import { detectProvider, testAiKey } from "@/lib/ai";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiKey = await getAiKey(userId);
    return NextResponse.json({
      provider: aiKey?.provider || null,
      hasKey: !!aiKey,
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

    const encryptedKey = encrypt(trimmedKey);
    await updateAiKey(userId, encryptedKey, provider);

    return NextResponse.json({
      success: true,
      provider,
      message: `Connected to ${provider === "openrouter" ? "OpenRouter" : provider === "anthropic" ? "Anthropic" : "OpenAI"}.`,
    });
  } catch (error) {
    console.error("Error saving AI key:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save API key" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteAiKey(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting AI key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 },
    );
  }
}
