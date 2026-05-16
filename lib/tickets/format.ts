interface TicketData {
  title?: string;
  priority?: string;
  description?: string;
  steps?: string[];
  expected?: string;
  actual?: string;
  environment?: string;
  additionalNotes?: string;
}

function parseTicketString(text: string): TicketData {
  try {
    const parsed = JSON.parse(text);
    if (parsed.title) {
      return {
        title: parsed.title,
        priority: parsed.priority,
        description: parsed.description,
        steps: Array.isArray(parsed.steps) ? parsed.steps : undefined,
        expected: parsed.expected,
        actual: parsed.actual,
        environment: parsed.environment,
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

export function ticketToPlainText(ticketText: string): string {
  const ticket = parseTicketString(ticketText);

  const lines: string[] = [];

  if (ticket.title) {
    lines.push(`Title: ${ticket.title}`);
  }

  if (ticket.priority) {
    lines.push(`Priority: ${ticket.priority}`);
  }

  if (ticket.description) {
    lines.push("");
    lines.push("Description:");
    lines.push(ticket.description);
  }

  if (ticket.steps && ticket.steps.length > 0) {
    lines.push("");
    lines.push("Steps to Reproduce:");
    ticket.steps.forEach((step, i) => {
      lines.push(`  ${i + 1}. ${step}`);
    });
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

  if (ticket.additionalNotes) {
    lines.push("");
    lines.push(`Notes: ${ticket.additionalNotes}`);
  }

  return lines.join("\n");
}
