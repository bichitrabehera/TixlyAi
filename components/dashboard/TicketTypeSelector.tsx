"use client";

import {
  TICKET_TYPE_META,
  TICKET_TYPES,
  type TicketType,
} from "@/lib/constants";

interface TicketTypeSelectorProps {
  value: TicketType | undefined;
  onChange: (value: TicketType | undefined) => void;
}

const idleClass =
  "border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground";
const activeClass =
  "border-primary/10 bg-primary/10 text-primary";
const pillClass =
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors";

export function TicketTypeSelector({
  value,
  onChange,
}: TicketTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Ticket type
        </span>
        <span className="text-xs text-muted-foreground/60">( optional )</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`${pillClass} ${value === undefined ? activeClass : idleClass}`}
        >
          Auto
        </button>

        {TICKET_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(value === type ? undefined : type)}
            title={TICKET_TYPE_META[type].description}
            className={`${pillClass} ${value === type ? activeClass : idleClass}`}
          >
            <span>{TICKET_TYPE_META[type].emoji}</span>
            <span>{TICKET_TYPE_META[type].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
