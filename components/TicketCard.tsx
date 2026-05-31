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
      {/* Title + Priority */}
      <div className="space-y-2">
        {ticket.title && (
          <h2 className="text-base font-medium text-[var(--text)]">
            {ticket.title}
          </h2>
        )}

        {ticket.priority && (
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              priorityColors[ticket.priority] ||
              "bg-[var(--border)]/40 text-[var(--text)]/70"
            }`}
          >
            {ticket.priority}
          </span>
        )}
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-sm text-[var(--text)]/90 leading-relaxed">
          {ticket.description}
        </p>
      )}

      {/* Steps */}
      {ticket.steps && ticket.steps.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-[var(--muted)]">
            Steps to reproduce
          </p>

          <ol className="space-y-2 list-decimal list-inside text-sm text-[var(--text)]/90 leading-relaxed marker:text-[var(--muted)]">
            {ticket.steps.map((step, i) => (
              <li key={i} className="pl-1">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Expected vs Actual */}
      {(ticket.expected || ticket.actual) && (
        <div className="grid gap-3">
          {ticket.expected && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-[var(--muted)]">
                Expected
              </p>
              <p className="text-sm text-[var(--text)]/90 leading-relaxed">
                {ticket.expected}
              </p>
            </div>
          )}

          {ticket.actual && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-[var(--muted)]">Actual</p>
              <p className="text-sm text-[var(--text)]/90 leading-relaxed">
                {ticket.actual}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
