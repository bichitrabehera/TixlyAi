import { TicketRequest } from "./schemas";
import {
  TEMPERATURE_MAP,
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

export function determineTemperature(preferredPriority?: string) {
  return preferredPriority ? TEMPERATURE_MAP[preferredPriority] ?? 0.3 : 0.3;
}

export function buildPrompt(req: TicketRequest) {
  const temperature = determineTemperature(req.preferredPriority);

  const system = `You are an expert bug triage specialist. Given a screenshot of a software issue (and optional OCR text + user note), produce a SINGLE JSON object conforming exactly to the schema in the user prompt. Analyze the actual pixels of the screenshot: UI layout, error text, broken components, button states. Use OCR_TEXT only as supporting evidence. If the input language is not English, translate visible text to English and note the original language in additionalNotes. If information is ambiguous or insufficient, set needsHumanReview to true and include a short reason in additionalNotes. Never hallucinate details not visible in the image or present in the inputs.`;

  const typeInstruction = req.ticketType
    ? `The ticket type is "${req.ticketType}". Set the "type" field to "${req.ticketType}" and produce the following fields: ${TYPE_FIELDS[
        req.ticketType
      ].join(", ")}.`
    : `Determine the ticket type from the screenshot and set the "type" field to one of: ${TICKET_TYPES.join(
        ", ",
      )}. Then produce the fields for that type as follows:\n${TICKET_TYPES.map(
        (t) => `- ${t}: ${TYPE_FIELDS[t].join(", ")}`,
      ).join("\n")}`;

  const user = `
Input fields:
- OCR_TEXT: the raw text extracted from the screenshot (optional, may be empty)
- USER_NOTE: optional user-provided context (may be empty)
- SCREENSHOT_URL: optional image URL to analyze
- TICKET_TYPE: optional pre-selected ticket type
- DETAIL_LEVEL: optional detail level (concise | standard | detailed)

Produce a JSON object with:
- type: one of ${TICKET_TYPES.join("|")}
- title: short summary (max ${TICKET_TITLE_MAX_LENGTH} chars)
- priority: one of ${PRIORITIES.join("|")}
- description: 2-3 sentence explanation
${typeInstruction}

Rules:
1) Only use information explicitly present in the screenshot, OCR_TEXT, or USER_NOTE.
2) If unsure, prefer "Not specified" or set "needsHumanReview": true.
3) Output MUST be valid JSON parsable by a strict JSON parser and must conform to the schema.
4) Do not invent details that are not visible in the screenshot or present in the inputs.

Here is the input:
SCREENSHOT_URL: ${
    req.screenshotUrl && !req.screenshotUrl.startsWith("data:")
      ? req.screenshotUrl
      : req.screenshotUrl || req.imageDataUri
        ? "(image attached via multimodal content)"
        : "Not provided"
  }

OCR_TEXT:
"""
${req.ocrText || ""}
"""

USER_NOTE:
"""
${req.note || ""}
"""

Request settings:
- ticketType: ${req.ticketType || "auto (infer from screenshot)"}
- detailLevel: ${req.detailLevel || "standard"}
- includeReproSteps: ${req.includeReproSteps ? "yes" : "not specified"}
- detectSeverity: ${req.detectSeverity ? "yes" : "not specified"}
- detectComponent: ${req.detectComponent ? "yes" : "not specified"}
- includeTechnicalContext: ${req.includeTechnicalContext ? "yes" : "not specified"}

Return only the JSON object (no surrounding explanation).`;

  return { system, user, temperature };
}
