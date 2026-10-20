import { createAgent, toolStrategy } from "langchain";
import type { AiProvider } from "@/lib/constants";
import { TicketOutputSchema, type TicketRequest } from "@/lib/tickets/schemas";
import { createChatModel } from "./models";
import { buildSystemPrompt } from "./prompts";
import { createTicketTools } from "./tools";
import { buildAgentMiddleware } from "./middleware";
import { temperatureFor } from "./config";

export interface TicketAgentOptions {
  provider: AiProvider;
  apiKey: string;
  req: TicketRequest;
  userId: string;
  /** User-selected model id; falls back to the provider default when absent. */
  model?: string;
}

/**
 * Builds the ticket-generation agent:
 *
 *   model (BYOK, user-selected or provider default) + tools (real DB/guideline lookups)
 *   + system prompt (pixel analysis rules)
 *   + responseFormat (tool-based structured output — non-strict, so the
 *     Zod schema's optional fields stay legal for OpenAI's strict mode)
 *   + middleware stack (guardrails, retries, limits, PII, observability)
 */
export function createTicketAgent({ provider, apiKey, req, userId, model }: TicketAgentOptions) {
  const chatModel = createChatModel(
    provider,
    apiKey,
    temperatureFor(req.preferredPriority),
    model,
  );

  return createAgent({
    model: chatModel,
    tools: createTicketTools(userId),
    systemPrompt: buildSystemPrompt(req),
    responseFormat: toolStrategy(TicketOutputSchema),
    middleware: buildAgentMiddleware(),
  });
}
