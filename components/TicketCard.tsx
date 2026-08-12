"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TICKET_TYPE_META, type TicketType } from "@/lib/constants";

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
    if (parsed.title && parsed.priority) {
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
  CRITICAL: "bg-green-600/15 text-green-700 dark:text-green-300 border-green-600/25",
  HIGH: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  MEDIUM: "bg-green-400/10 text-green-600 dark:text-green-400 border-green-400/20",
  LOW: "bg-[var(--border)]/50 text-[var(--muted)] border-[var(--border)]",
};

const severityColors: Record<string, string> = {
  CRITICAL: "bg-green-600/15 text-green-700 dark:text-green-300 border-green-600/25",
  HIGH: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  MEDIUM: "bg-green-400/10 text-green-600 dark:text-green-400 border-green-400/20",
  LOW: "bg-[var(--border)]/50 text-[var(--muted)] border-[var(--border)]",
};

const neutralBadgeClass =
  "border-0 bg-[var(--border)]/40 text-[var(--text)]/70";

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-md px-2 py-1 text-xs", className)}
    >
      {children}
    </Badge>
  );
}

function SectionList({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <ol className="space-y-2 list-decimal list-inside text-sm text-[var(--text)]/90 leading-relaxed marker:text-[var(--muted)]">
        {items.map((item, i) => (
          <li key={i} className="pl-1">
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SectionText({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
      <p className="text-sm text-[var(--text)]/90 leading-relaxed">{value}</p>
    </div>
  );
}

export function TicketCard({ ticketText }: { ticketText: string }) {
  const ticket = parseTicketString(ticketText);

  if (!ticket.title && !ticket.description) {
    return (
      <pre className="whitespace-pre-wrap text-sm text-(--text)/70">
        {ticketText}
      </pre>
    );
  }

  const typeMeta = ticket.type
    ? TICKET_TYPE_META[ticket.type as TicketType]
    : null;

  return (
    <div className="space-y-5">
      {/* Title + badges */}
      <div className="space-y-2">
        {ticket.title && (
          <h2 className="text-base font-medium text-[var(--text)]">
            {ticket.title}
          </h2>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {typeMeta && (
            <Pill className={neutralBadgeClass}>
              {typeMeta.emoji} {typeMeta.label}
            </Pill>
          )}

          {ticket.priority && (
            <Pill
              className={
                priorityColors[ticket.priority] || neutralBadgeClass
              }
            >
              {ticket.priority}
            </Pill>
          )}

          {ticket.severity && (
            <Pill
              className={
                severityColors[ticket.severity] || neutralBadgeClass
              }
            >
              Severity: {ticket.severity}
            </Pill>
          )}

          {ticket.component && (
            <Pill className={neutralBadgeClass}>{ticket.component}</Pill>
          )}
        </div>
      </div>

      {/* Description */}
      {ticket.description && (
        <p className="text-sm text-[var(--text)]/90 leading-relaxed">
          {ticket.description}
        </p>
      )}

      {/* Location */}
      {ticket.location && <SectionText label="Location" value={ticket.location} />}

      {/* Steps */}
      {ticket.steps && ticket.steps.length > 0 && (
        <SectionList label="Steps to reproduce" items={ticket.steps} />
      )}

      {/* Expected vs Actual */}
      {(ticket.expected || ticket.actual) && (
        <div className="grid gap-3">
          {ticket.expected && (
            <SectionText label="Expected" value={ticket.expected} />
          )}

          {ticket.actual && (
            <SectionText label="Actual" value={ticket.actual} />
          )}
        </div>
      )}

      {/* User story */}
      {ticket.userStory && (
        <SectionText label="User story" value={ticket.userStory} />
      )}

      {/* Acceptance criteria */}
      {ticket.acceptanceCriteria && ticket.acceptanceCriteria.length > 0 && (
        <SectionList
          label="Acceptance criteria"
          items={ticket.acceptanceCriteria}
        />
      )}

      {/* Scope */}
      {ticket.scope && <SectionText label="Scope" value={ticket.scope} />}

      {/* Summary */}
      {ticket.summary && <SectionText label="Summary" value={ticket.summary} />}

      {/* Sentiment */}
      {ticket.sentiment && (
        <SectionText label="Sentiment" value={ticket.sentiment} />
      )}

      {/* Action items */}
      {ticket.actionItems && ticket.actionItems.length > 0 && (
        <SectionList label="Action items" items={ticket.actionItems} />
      )}

      {/* Checklist */}
      {ticket.checklist && ticket.checklist.length > 0 && (
        <SectionList label="Checklist" items={ticket.checklist} />
      )}

      {/* Environment */}
      {ticket.environment && (
        <SectionText label="Environment" value={ticket.environment} />
      )}

      {/* Notes */}
      {ticket.additionalNotes && (
        <SectionText label="Notes" value={ticket.additionalNotes} />
      )}
    </div>
  );
}
