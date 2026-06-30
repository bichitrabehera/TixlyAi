import { decrypt } from "@/lib/crypto";
import { callOpenAI } from "./openai";
import { callOpenRouter } from "./openrouter";
import { callAnthropic } from "./anthropic";
import type { AiProvider } from "@/lib/constants";

export function detectProvider(apiKey: string): AiProvider | null {
  if (apiKey.startsWith("sk-or-v1-")) return "openrouter";
  if (apiKey.startsWith("sk-ant-")) return "anthropic";
  if (apiKey.startsWith("sk-")) return "openai";
  return null;
}

export interface AiCallParams {
  system: string;
  user: string;
  temperature: number;
}

export async function callAi(
  encryptedKey: string,
  provider: AiProvider,
  params: AiCallParams,
): Promise<string> {
  const apiKey = decrypt(encryptedKey);

  switch (provider) {
    case "openai":
      return callOpenAI(apiKey, params.system, params.user, params.temperature);
    case "openrouter":
      return callOpenRouter(apiKey, params.system, params.user, params.temperature);
    case "anthropic":
      return callAnthropic(apiKey, params.system, params.user, params.temperature);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

export async function testAiKey(apiKey: string, provider: AiProvider): Promise<boolean> {
  try {
    switch (provider) {
      case "openai":
        await callOpenAI(apiKey, "Respond with just: ok", "ok", 0);
        break;
      case "openrouter":
        await callOpenRouter(apiKey, "Respond with just: ok", "ok", 0);
        break;
      case "anthropic":
        await callAnthropic(apiKey, "Respond with just: ok", "ok", 0);
        break;
    }
    return true;
  } catch {
    return false;
  }
}
