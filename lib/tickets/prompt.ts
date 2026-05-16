import { TicketRequest } from "./schemas";

export function determineTemperature(preferredPriority?: string) {
  // Lower temperature for critical issues for deterministic output
  switch (preferredPriority) {
    case "CRITICAL":
      return 0.0;
    case "HIGH":
      return 0.1;
    case "MEDIUM":
      return 0.3;
    case "LOW":
      return 0.5;
    default:
      return 0.3;
  }
}

export function buildPrompt(req: TicketRequest) {
  const temperature = determineTemperature(req.preferredPriority);

  const system = `You are an expert bug triage specialist. When given OCR text and optional user notes, produce a SINGLE JSON object that exactly matches the schema described in the user prompt. If the input language is not English, first translate the visible text into English and then analyze it; include the original language in \"additionalNotes\". If the information is ambiguous or insufficient, set \"needsHumanReview\" to true and include a short \"reason\" string in \"additionalNotes\". Never hallucinate details.`;

  const user = `
Input fields:
- OCR_TEXT: the raw text extracted from the screenshot
- USER_NOTE: optional user-provided context
- SCREENSHOT_URL: optional image URL

Produce a JSON object with the following fields:
- title: short summary (max 80 chars)
- priority: one of CRITICAL|HIGH|MEDIUM|LOW
- description: 2-3 sentence explanation
- steps: array of up to 5 reproducible steps (optional)
- expected: expected behavior (optional)
- actual: actual behavior or exact error messages (optional)
- environment: device/browser/OS/app version if extractable (optional)
- additionalNotes: free text (optional)
- needsHumanReview: boolean (optional)

Rules:
1) Only use information explicitly present in OCR_TEXT or USER_NOTE.
2) If unsure, prefer \"Not specified\" or set \"needsHumanReview\": true.
3) Output MUST be valid JSON parsable by a strict JSON parser and must conform to the schema.

Here is the input:
OCR_TEXT:
"""
${req.ocrText}
"""

USER_NOTE:
"""
${req.note || ""}
"""

SCREENSHOT_URL: ${req.screenshotUrl || "Not provided"}

Return only the JSON object (no surrounding explanation).`;

  return { system, user, temperature };
}
