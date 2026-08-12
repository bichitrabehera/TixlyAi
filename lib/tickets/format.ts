import { TICKET_TYPE_META } from "@/lib/constants";

interface TicketData {
  type?: string;
  title?: string;
  priority?: string;
  severity?: string;
  component?: string;
  description?: string;
  steps?: string[];
  expected?: string;
  actual?: string;
  environment?: string;
  userStory?: string;
  acceptanceCriteria?: string[];
  scope?: string;
  location?: string;
  summary?: string;
  sentiment?: string;
  actionItems?: string[];
  checklist?: string[];
  additionalNotes?: string;
}

function parseTicketString(text: string): TicketData {
  try {
    const parsed = JSON.parse(text);
    if (parsed.title) {
      return {
        type: parsed.type,
        title: parsed.title,
        priority: parsed.priority,
        severity: parsed.severity,
        component: parsed.component,
        description: parsed.description,
        steps: Array.isArray(parsed.steps) ? parsed.steps : undefined,
        expected: parsed.expected,
        actual: parsed.actual,
        environment: parsed.environment,
        userStory: parsed.userStory,
        acceptanceCriteria: Array.isArray(parsed.acceptanceCriteria)
          ? parsed.acceptanceCriteria
          : undefined,
        scope: parsed.scope,
        location: parsed.location,
        summary: parsed.summary,
        sentiment: parsed.sentiment,
        actionItems: Array.isArray(parsed.actionItems)
          ? parsed.actionItems
          : undefined,
        checklist: Array.isArray(parsed.checklist) ? parsed.checklist : undefined,
        additionalNotes: parsed.additionalNotes,
      };
    }
  } catch {}

  const data: TicketData = {};
  const lines = text.split("\n");
  let currentSection = "";
  const sections: Record<string, string[]> = {};

  for (const line of lines) {
    const emoji = line.match(/^[^\w\s]{1,2}/)?.[0] || "";
    if (emoji && ["🐛", "📊", "📝", "🔄", "✅", "❌", "🌍", "🏷️", "📌"].includes(emoji)) {
      currentSection = emoji;
      sections[emoji] = [line.replace(emoji, "").trim()];
    } else if (currentSection) {
      sections[currentSection].push(line);
    }
  }

  data.title = sections["🐛"]?.join("\n").trim();
  data.priority = sections["📊"]?.join("\n").trim();
  data.description = sections["📝"]?.join("\n").trim();
  data.environment = sections["🌍"]?.join("\n").trim();

  const stepsText = sections["🔄"]?.join("\n").trim();
  if (stepsText) {
    data.steps = stepsText
      .split("\n")
      .map((s) => s.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);
  }

  data.expected = sections["✅"]?.join("\n").trim();
  data.actual = sections["❌"]?.join("\n").trim();

  return data;
}

function numberedList(items: string[]): string[] {
  return items.map((item, i) => `  ${i + 1}. ${item}`);
}

export function ticketToPlainText(ticketText: string): string {
  const ticket = parseTicketString(ticketText);

  const lines: string[] = [];

  if (ticket.title) {
    lines.push(`Title: ${ticket.title}`);
  }

  if (ticket.type) {
    const label = TICKET_TYPE_META[ticket.type as keyof typeof TICKET_TYPE_META]?.label;
    lines.push(`Type: ${label || ticket.type}`);
  }

  if (ticket.priority) {
    lines.push(`Priority: ${ticket.priority}`);
  }

  if (ticket.severity) {
    lines.push(`Severity: ${ticket.severity}`);
  }

  if (ticket.component) {
    lines.push(`Component: ${ticket.component}`);
  }

  if (ticket.description) {
    lines.push("");
    lines.push("Description:");
    lines.push(ticket.description);
  }

  if (ticket.steps && ticket.steps.length > 0) {
    lines.push("");
    lines.push("Steps to Reproduce:");
    lines.push(...numberedList(ticket.steps));
  }

  if (ticket.expected) {
    lines.push("");
    lines.push("Expected Behavior:");
    lines.push(ticket.expected);
  }

  if (ticket.actual) {
    lines.push("");
    lines.push("Actual Behavior:");
    lines.push(ticket.actual);
  }

  if (ticket.environment) {
    lines.push("");
    lines.push(`Environment: ${ticket.environment}`);
  }

  if (ticket.userStory) {
    lines.push("");
    lines.push(`User Story: ${ticket.userStory}`);
  }

  if (ticket.acceptanceCriteria && ticket.acceptanceCriteria.length > 0) {
    lines.push("");
    lines.push("Acceptance Criteria:");
    lines.push(...numberedList(ticket.acceptanceCriteria));
  }

  if (ticket.scope) {
    lines.push("");
    lines.push(`Scope: ${ticket.scope}`);
  }

  if (ticket.location) {
    lines.push("");
    lines.push(`Location: ${ticket.location}`);
  }

  if (ticket.summary) {
    lines.push("");
    lines.push(`Summary: ${ticket.summary}`);
  }

  if (ticket.sentiment) {
    lines.push(`Sentiment: ${ticket.sentiment}`);
  }

  if (ticket.actionItems && ticket.actionItems.length > 0) {
    lines.push("");
    lines.push("Action Items:");
    lines.push(...numberedList(ticket.actionItems));
  }

  if (ticket.checklist && ticket.checklist.length > 0) {
    lines.push("");
    lines.push("Checklist:");
    lines.push(...numberedList(ticket.checklist));
  }

  if (ticket.additionalNotes) {
    lines.push("");
    lines.push(`Notes: ${ticket.additionalNotes}`);
  }

  return lines.join("\n");
}
