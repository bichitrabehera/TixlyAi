import type { AiProvider } from "@/lib/constants";
import { createChatModel } from "./models";

export { createChatModel } from "./models";
export { createTicketAgent } from "./agent";
export { streamTicketRun, type StreamRunOptions } from "./run";
export { GuardrailViolationError } from "./middleware";
export type {
  RunStreamEvent,
  StreamStep,
  StreamStepStatus,
} from "./stream-types";
export { AI_MODEL_CONFIG, RUN_STEPS } from "./config";

export function detectProvider(apiKey: string): AiProvider | null {
  if (apiKey.startsWith("sk-or-v1-")) return "openrouter";
  if (apiKey.startsWith("sk-ant-")) return "anthropic";
  if (apiKey.startsWith("sk-")) return "openai";
  if (apiKey.startsWith("AQ.")) return "google";
  return null;
}

export async function testAiKey(
  apiKey: string,
  provider: AiProvider,
): Promise<boolean> {
  try {
    const model = createChatModel(provider, apiKey, 0);
    await model.invoke("Respond with just: ok");
    return true;
  } catch {
    return false;
  }
}
