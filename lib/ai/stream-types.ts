export type StreamStepStatus = "pending" | "running" | "done" | "error";

export interface StreamStep {
  id: string;
  label: string;
  status: StreamStepStatus;
}

export type RunStreamEvent =
  | { type: "step"; step: StreamStep }
  | { type: "guardrail"; level: "info" | "warn"; message: string }
  | {
      type: "done";
      ticket: string;
      needsReview: boolean;
      steps: StreamStep[];
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        model?: string;
        latencyMs?: number;
      };
      /** Set by the tickets API route once the ticket row is persisted. */
      ticketId?: string;
      /** True when generation succeeded but the DB insert failed. */
      saveFailed?: boolean;
    }
  | { type: "error"; message: string; code?: string };
