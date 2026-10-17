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
}

/**
 * Builds the ticket-generation agent:
 *
 *   model (BYOK) + tools (real DB/guideline lookups)
 *   + system prompt (pixel analysis rules)
 *   + responseFormat (tool-based structured output — non-strict, so the
 *     Zod schema's optional fields stay legal for OpenAI's strict mode)
 *   + middleware stack (guardrails, retries, limits, PII, observability)
 */
export function createTicketAgent({ provider, apiKey, req, userId }: TicketAgentOptions) {
  const model = createChatModel(
    provider,
    apiKey,
    temperatureFor(req.preferredPriority),
  );

  return createAgent({
    model,
    tools: createTicketTools(userId),
    systemPrompt: buildSystemPrompt(req),
    responseFormat: toolStrategy(TicketOutputSchema),
    middleware: buildAgentMiddleware(),
  });
}
