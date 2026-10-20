import { z } from "zod";
import {
  AI_PROVIDERS,
  MAX_IMAGE_DATA_URI_LENGTH,
  MAX_NOTE_LENGTH,
  MAX_OCR_TEXT_LENGTH,
  PRIORITIES,
  TICKET_TYPES,
  DETAIL_LEVELS,
  TICKET_TITLE_MAX_LENGTH,
} from "@/lib/constants";

/**
 * Screenshots must come from https (or localhost in dev) so a persisted
 * javascript:/data: URL can never end up rendered or linked later.
 */
function isSafeScreenshotUrl(value: string): boolean {
  return (
    value.startsWith("https://") ||
    /^http:\/\/localhost(:\d+)?(\/|$)/.test(value)
  );
}

export const TicketRequestSchema = z.object({
  ocrText: z.string().max(MAX_OCR_TEXT_LENGTH).optional().nullable(),
  note: z.string().max(MAX_NOTE_LENGTH).optional().nullable(),
  screenshotUrl: z
    .string()
    .url()
    .refine(isSafeScreenshotUrl, {
      message: "Screenshot URL must use https",
    })
    .optional()
    .nullable(),
  imageDataUri: z
    .string()
    .max(MAX_IMAGE_DATA_URI_LENGTH, {
      message: "Image is larger than 10 MB",
    })
    .optional()
    .nullable(),
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
  /** Model's self-reported certainty that the ticket is accurate and complete (0–100). */
  confidence: z.number().min(0).max(100).optional(),
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
