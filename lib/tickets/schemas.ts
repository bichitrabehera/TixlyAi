import { z } from "zod";
import {
  AI_PROVIDERS,
  PRIORITIES,
  TICKET_TYPES,
  DETAIL_LEVELS,
  TICKET_TITLE_MAX_LENGTH,
} from "@/lib/constants";

export const TicketRequestSchema = z.object({
  ocrText: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  screenshotUrl: z.string().url().optional().nullable(),
  imageDataUri: z.string().optional().nullable(),
  preferredPriority: z.enum(PRIORITIES).optional(),
  language: z.string().optional(),
  ticketType: z.enum(TICKET_TYPES).optional(),
  detailLevel: z.enum(DETAIL_LEVELS).optional(),
  includeReproSteps: z.boolean().optional(),
  detectSeverity: z.boolean().optional(),
  detectComponent: z.boolean().optional(),
  includeTechnicalContext: z.boolean().optional(),
  provider: z.enum(AI_PROVIDERS).optional(),
  model: z.string().min(1).max(120).optional(),
  modelVision: z.boolean().optional(),
});

const baseTicketFields = {
  type: z.enum(TICKET_TYPES),
  title: z.string().min(1).max(TICKET_TITLE_MAX_LENGTH),
  priority: z.enum(PRIORITIES),
  description: z.string().min(1),
  additionalNotes: z.string().optional(),
  needsHumanReview: z.boolean().optional(),
};

/**
 * One flat object covering every ticket type's fields.
 *
 * OpenAI function parameters must have a top-level `type: "object"`, so a
 * discriminated union can't be used directly as the structured-output schema.
 * Every type still fills only its own fields — the system prompt and the
 * get_ticket_template tool drive that — while type stays an enum of all five.
 * Per-type required fields were never enforced anyway (all of them optional).
 */
export const TicketOutputSchema = z.object({
  ...baseTicketFields,

  // bug / ui
  steps: z.array(z.string()).optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  environment: z.string().optional(),

  // bug
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  component: z.string().optional(),

  // feature
  userStory: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  scope: z.string().optional(),

  // ui
  location: z.string().optional(),

  // feedback
  summary: z.string().optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  actionItems: z.array(z.string()).optional(),

  // task
  checklist: z.array(z.string()).optional(),
});

export type TicketRequest = z.infer<typeof TicketRequestSchema>;
export type TicketOutput = z.infer<typeof TicketOutputSchema>;
