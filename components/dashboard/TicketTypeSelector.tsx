"use client";

import {
  Bug,
  CheckSquare,
  Layers,
  MessageSquare,
  Sparkles,
  Wand2,
} from "lucide-react";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import {
  TICKET_TYPE_META,
  TICKET_TYPES,
  type TicketType,
} from "@/lib/constants";

interface TicketTypeSelectorProps {
  value: TicketType | undefined;
  onChange: (value: TicketType | undefined) => void;
  disabled?: boolean;
}

type SegmentValue = TicketType | "auto";

const ICONS: Record<SegmentValue, React.ReactNode> = {
  auto: <Wand2 className="h-3.5 w-3.5" aria-hidden />,
  bug: <Bug className="h-3.5 w-3.5" aria-hidden />,
  feature: <Sparkles className="h-3.5 w-3.5" aria-hidden />,
  ui: <Layers className="h-3.5 w-3.5" aria-hidden />,
  feedback: <MessageSquare className="h-3.5 w-3.5" aria-hidden />,
  task: <CheckSquare className="h-3.5 w-3.5" aria-hidden />,
};

const SHORT_LABELS: Record<TicketType, string> = {
  bug: "Bug",
  feature: "Feature",
  ui: "UI",
  feedback: "Feedback",
  task: "Task",
};

export function TicketTypeSelector({
  value,
  onChange,
  disabled = false,
}: TicketTypeSelectorProps) {
  const options = [
    { value: "auto" as const, label: "Auto", icon: ICONS.auto },
    ...TICKET_TYPES.map((type) => ({
      value: type,
      label: SHORT_LABELS[type],
      icon: ICONS[type],
      title: TICKET_TYPE_META[type].description,
    })),
  ];

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">
          Classification
        </span>
      </div>

      <SegmentedControl<SegmentValue>
        value={value ?? "auto"}
        onChange={(next) => onChange(next === "auto" ? undefined : next)}
        options={options}
        ariaLabel="Ticket classification"
        disabled={disabled}
      />
    </section>
  );
}
