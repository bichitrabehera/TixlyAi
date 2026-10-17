import { z } from "zod";

/**
 * Shared custom state merged into the agent state by our middlewares.
 * Every middleware in the stack receives the same schema so hooks can
 * read and write each other's fields (LangGraph merges them).
 */
export const TicketAgentState = z.object({
  guardrailHits: z.array(z.string()).default([]),
  runSteps: z
    .array(
      z.object({
        kind: z.enum(["model_call", "tool_call", "guardrail"]),
        label: z.string(),
        at: z.string(),
      }),
    )
    .default([]),
});

export type TicketAgentStateShape = z.infer<typeof TicketAgentState>;
