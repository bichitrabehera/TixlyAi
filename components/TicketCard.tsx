"use client";

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
    if (parsed.title && parsed.priority) {
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
    if (
      emoji &&
      ["🐛", "📊", "📝", "🔄", "✅", "❌", "🌍", "🏷️", "📌"].includes(emoji)
    ) {
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

const priorityColors: Record<string, string> = {
  CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
  HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  LOW: "bg-green-500/10 text-green-400 border-green-500/20",
};

export function TicketCard({ ticketText }: { ticketText: string }) {
  const ticket = parseTicketString(ticketText);

  if (!ticket.title && !ticket.description) {
    return (
      <pre className="whitespace-pre-wrap text-sm text-(--text)/70">
        {ticketText}
      </pre>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded border border-(--border) bg-(--bg) p-6">
        {ticket.title && (
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-(--text)">
              {ticket.title}
            </h3>
          </div>
        )}

        {ticket.priority && (
          <div className="mb-5">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                priorityColors[ticket.priority] ||
                "bg-(--border)/40 text-(--text)/70"
              }`}
            >
              {ticket.priority}
            </span>
          </div>
        )}

        {ticket.description && (
          <div className="mb-5">
            <p className="mb-2 text-xs uppercase tracking-wider text-(--text)/40">
              Description
            </p>
            <p className="text-sm leading-7 text-(--text)/80">
              {ticket.description}
            </p>
          </div>
        )}

        {ticket.steps && ticket.steps.length > 0 && (
          <div className="mb-5">
            <p className="mb-3 text-xs uppercase tracking-wider text-(--text)/40">
              Steps to Reproduce
            </p>
            <div className="space-y-3">
              {ticket.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-sm text-(--text)/80"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary)/10 text-xs font-medium text-(--primary)">
                    {i + 1}
                  </div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(ticket.expected || ticket.actual) && (
          <div className="grid gap-4 md:grid-cols-2">
            {ticket.expected && (
              <div className="rounded-xl border border-(--border) p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-green-500">
                  Expected
                </p>
                <p className="text-sm text-(--text)/80">{ticket.expected}</p>
              </div>
            )}

            {ticket.actual && (
              <div className="rounded-xl border border-(--border) p-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-red-500">
                  Actual
                </p>
                <p className="text-sm text-(--text)/80">{ticket.actual}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
