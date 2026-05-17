import { z } from "zod";
import { PRIORITIES, TICKET_TITLE_MAX_LENGTH } from "@/lib/constants";

export const TicketRequestSchema = z.object({
  ocrText: z.string().min(1),
  note: z.string().optional().nullable(),
  screenshotUrl: z.string().url().optional().nullable(),
  preferredPriority: z.enum(PRIORITIES).optional(),
  language: z.string().optional(),
});

export const TicketOutputSchema = z.object({
  title: z.string().min(1).max(TICKET_TITLE_MAX_LENGTH),
  priority: z.enum(PRIORITIES),
  description: z.string().min(1),
  steps: z.array(z.string()).optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  environment: z.string().optional(),
  additionalNotes: z.string().optional(),
  needsHumanReview: z.boolean().optional(),
});

export type TicketRequest = z.infer<typeof TicketRequestSchema>;
export type TicketOutput = z.infer<typeof TicketOutputSchema>;
