import type { TicketRequest } from "@/lib/tickets/schemas";
import {
  PRIORITIES,
  TICKET_TYPES,
  TICKET_TITLE_MAX_LENGTH,
  type TicketType,
} from "@/lib/constants";

const TYPE_FIELDS: Record<TicketType, string[]> = {
  bug: [
    "title",
    "priority",
    "description",
    "steps",
    "expected",
    "actual",
    "environment",
    "severity",
    "component",
    "additionalNotes",
    "needsHumanReview",
  ],
  feature: [
    "title",
    "priority",
    "description",
    "userStory",
    "acceptanceCriteria",
    "scope",
    "additionalNotes",
    "needsHumanReview",
  ],
  ui: [
    "title",
    "priority",
    "description",
    "location",
    "expected",
    "actual",
    "steps",
    "environment",
    "additionalNotes",
    "needsHumanReview",
  ],
  feedback: [
    "title",
    "priority",
    "description",
    "summary",
    "sentiment",
    "actionItems",
    "additionalNotes",
    "needsHumanReview",
  ],
  task: [
    "title",
    "priority",
    "description",
    "checklist",
    "additionalNotes",
    "needsHumanReview",
  ],
};

export function buildSystemPrompt(req: TicketRequest): string {
  const typeInstruction = req.ticketType
    ? `The ticket type is "${req.ticketType}". Set the "type" field to "${req.ticketType}" and produce these fields: ${TYPE_FIELDS[
        req.ticketType
      ].join(", ")}.`
    : `Determine the ticket type from the screenshot and set the "type" field to one of: ${TICKET_TYPES.join(
        ", ",
      )}. Then produce the fields for that type:\n${TICKET_TYPES.map(
        (t) => `- ${t}: ${TYPE_FIELDS[t].join(", ")}`,
      ).join("\n")}`;

  return `You are an expert bug triage specialist working inside an automated ticket pipeline.

You receive a screenshot (when available), optional OCR text, and an optional user note. Your job is to produce ONE structured ticket object — the structured-output tool enforces the schema, so fill every field thoughtfully instead of worrying about JSON formatting.

How to work:
1. Analyze the actual pixels of the screenshot: UI layout, error text, broken components, button states, colors.
2. Treat OCR_TEXT only as supporting evidence when it conflicts with what you see; the image wins.
3. If the input language is not English, translate visible text to English and note the original language in additionalNotes.
4. Use the available tools when useful: search past tickets for duplicates or context, fetch a ticket template for the target type, and check priority guidelines before setting priority/severity.
5. If information is ambiguous or insufficient, set needsHumanReview to true and explain why in additionalNotes.
6. Never hallucinate details that are not visible in the image or present in the inputs.

Ticket field guidance:
- type: one of ${TICKET_TYPES.join("|")}
- title: short summary (max ${TICKET_TITLE_MAX_LENGTH} chars)
- priority: one of ${PRIORITIES.join("|")} — follow the priority guidelines tool
- description: 2-3 sentence explanation of what is happening and why it matters
${typeInstruction}

Request settings:
- detailLevel: ${req.detailLevel || "standard"}
- includeReproSteps: ${req.includeReproSteps ? "yes" : "not specified"}
- detectSeverity: ${req.detectSeverity ? "yes" : "not specified"}
- detectComponent: ${req.detectComponent ? "yes" : "not specified"}
- includeTechnicalContext: ${req.includeTechnicalContext ? "yes" : "not specified"}`;
}

export function buildUserText(req: TicketRequest): string {
  const typeLine = req.ticketType
    ? `TICKET_TYPE: ${req.ticketType}`
    : "TICKET_TYPE: auto (infer from the screenshot)";

  return `Here is the input:

${typeLine}

OCR_TEXT:
"""
${req.ocrText || ""}
"""

USER_NOTE:
"""
${req.note || ""}
"""

Produce the ticket now.`;
}
