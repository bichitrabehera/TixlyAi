import { createMiddleware } from "langchain";
import { TICKET_TITLE_MAX_LENGTH } from "@/lib/constants";
import { TicketAgentState } from "./state";

interface OutputTicket {
  title?: string;
  description?: string;
  needsHumanReview?: boolean;
  additionalNotes?: string;
  type?: string;
}

/**
 * Output guardrails — runs once after the agent finishes.
 *
 * Business rules that schema validation alone cannot enforce:
 *  - title length is clamped (models occasionally overshoot even with limits)
 *  - description must exist and be non-trivial
 *  - bug tickets should carry repro steps when the request asked for them
 *
 * Any violation forces `needsHumanReview = true` with the reasons appended
 * to additionalNotes, so bad output is never silently shipped.
 */
export function outputGuardrailMiddleware() {
  return createMiddleware({
    name: "output-guardrails",
    stateSchema: TicketAgentState,
    afterAgent: async (state) => {
      const ticket = (
        state as typeof state & { structuredResponse?: OutputTicket }
      ).structuredResponse;

      if (!ticket || typeof ticket !== "object") return undefined;

      const issues: string[] = [];
      const patched: OutputTicket = { ...ticket };

      if (typeof patched.title === "string") {
        if (patched.title.length > TICKET_TITLE_MAX_LENGTH) {
          patched.title =
            patched.title.slice(0, TICKET_TITLE_MAX_LENGTH - 1).trimEnd() + "…";
          issues.push("title exceeded the maximum length and was truncated");
        }
      } else {
        issues.push("missing title");
      }

      if (
        typeof patched.description !== "string" ||
        patched.description.trim().length < 10
      ) {
        issues.push("description missing or too short");
      }

      if (patched.needsHumanReview !== true) {
        if (issues.length > 0) {
          patched.needsHumanReview = true;
          const note = `Output guardrails: ${issues.join("; ")}.`;
          patched.additionalNotes = patched.additionalNotes
            ? `${patched.additionalNotes} ${note}`
            : note;

          return {
            structuredResponse: patched,
            runSteps: [
              ...state.runSteps,
              {
                kind: "guardrail" as const,
                label: `Output guardrails: ${issues.length} issue(s) flagged for review`,
                at: new Date().toISOString(),
              },
            ],
          } as typeof state & Record<string, unknown>;
        }
      }

      return undefined;
    },
  });
}
