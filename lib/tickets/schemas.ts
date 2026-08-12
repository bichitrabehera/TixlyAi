import { z } from "zod";
import {
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
});

const baseTicketFields = {
  type: z.enum(TICKET_TYPES),
  title: z.string().min(1).max(TICKET_TITLE_MAX_LENGTH),
  priority: z.enum(PRIORITIES),
  description: z.string().min(1),
  additionalNotes: z.string().optional(),
  needsHumanReview: z.boolean().optional(),
};

const BugTicketSchema = z.object({
  ...baseTicketFields,
  steps: z.array(z.string()).optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  environment: z.string().optional(),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  component: z.string().optional(),
});

const FeatureTicketSchema = z.object({
  ...baseTicketFields,
  userStory: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  scope: z.string().optional(),
});

const UiTicketSchema = z.object({
  ...baseTicketFields,
  location: z.string().optional(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  steps: z.array(z.string()).optional(),
  environment: z.string().optional(),
});

const FeedbackTicketSchema = z.object({
  ...baseTicketFields,
  summary: z.string().optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  actionItems: z.array(z.string()).optional(),
});

const TaskTicketSchema = z.object({
  ...baseTicketFields,
  checklist: z.array(z.string()).optional(),
});

export const TicketOutputSchema = z.discriminatedUnion("type", [
  BugTicketSchema,
  FeatureTicketSchema,
  UiTicketSchema,
  FeedbackTicketSchema,
  TaskTicketSchema,
]);

export type TicketRequest = z.infer<typeof TicketRequestSchema>;
export type TicketOutput = z.infer<typeof TicketOutputSchema>;
