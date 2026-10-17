import { createMiddleware } from "langchain";
import { AIMessage } from "@langchain/core/messages";
import { TicketAgentState } from "./state";

function toolCallNames(message: unknown): string[] {
  if (!(message instanceof AIMessage)) return [];
  const calls = message.tool_calls;
  if (!Array.isArray(calls)) return [];
  return calls.map((c) => String(c.name ?? "unknown"));
}

/**
 * Observability middleware — records an introspection trail of what the
 * agent did (model calls, tool calls, guardrail events) in agent state,
 * so a run can be inspected after the fact alongside the live stream.
 */
export function observabilityMiddleware() {
  return createMiddleware({
    name: "run-observability",
    stateSchema: TicketAgentState,
    beforeModel: async (state) => {
      const modelCalls = state.runSteps.filter(
        (s) => s.kind === "model_call",
      ).length;
      return {
        runSteps: [
          ...state.runSteps,
          {
            kind: "model_call" as const,
            label: `Model call #${modelCalls + 1}`,
            at: new Date().toISOString(),
          },
        ],
      };
    },
    afterModel: async (state) => {
      const messages = state.messages ?? [];
      const last = messages[messages.length - 1];
      const names = toolCallNames(last);
      if (names.length === 0) return undefined;

      const label = `Tools: ${names.join(", ")}`;
      const lastStep = state.runSteps[state.runSteps.length - 1];
      if (lastStep?.kind === "tool_call" && lastStep.label === label) {
        return undefined;
      }

      return {
        runSteps: [
          ...state.runSteps,
          {
            kind: "tool_call" as const,
            label,
            at: new Date().toISOString(),
          },
        ],
      };
    },
  });
}
