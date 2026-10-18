"use client";

import { useId, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { Switch } from "@/components/ui/switch";
import type { OutputPreferencesValue } from "@/components/dashboard/OutputPreferences";
import { PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Priority = (typeof PRIORITIES)[number];
type BoolKey = Exclude<keyof OutputPreferencesValue, "detailLevel">;

interface AdvancedOptionsProps {
  value: OutputPreferencesValue;
  onChange: (value: OutputPreferencesValue) => void;
  priority: Priority | undefined;
  onPriorityChange: (value: Priority | undefined) => void;
  disabled?: boolean;
}

const TOGGLES: { key: BoolKey; label: string; hint: string }[] = [
  {
    key: "includeReproSteps",
    label: "Reproduction steps",
    hint: "Omit steps from the ticket.",
  },
  {
    key: "detectSeverity",
    label: "Severity",
    hint: "Priority only — no severity field.",
  },
  {
    key: "detectComponent",
    label: "Component",
    hint: "Leave the component unset.",
  },
  {
    key: "includeTechnicalContext",
    label: "Technical context",
    hint: "No stack or environment details.",
  },
];

const PRIORITY_OPTIONS = [
  { value: "auto" as const, label: "Auto" },
  ...PRIORITIES.map((priority) => ({
    value: priority,
    label: priority.charAt(0) + priority.slice(1).toLowerCase(),
  })),
];

export function AdvancedOptions({
  value,
  onChange,
  priority,
  onPriorityChange,
  disabled = false,
}: AdvancedOptionsProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const update = (key: BoolKey, checked: boolean) =>
    onChange({ ...value, [key]: checked });

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-control-border bg-canvas px-3 py-2 text-xs font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
      >
        <span className="flex items-center gap-1.5 font-medium">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Advanced options
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Advanced options"
          className="space-y-4 pt-3"
        >
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-ink">
              Priority override
            </span>
            <SegmentedControl
              value={priority ?? "auto"}
              onChange={(next) =>
                onPriorityChange(next === "auto" ? undefined : next)
              }
              options={PRIORITY_OPTIONS}
              ariaLabel="Priority override"
              disabled={disabled}
            />
          </div>

          <div className="divide-y divide-hairline overflow-hidden rounded-lg border border-control-border bg-canvas">
            {TOGGLES.map(({ key, label, hint }) => {
              const hintId = `pref-hint-${key}`;
              const on = value[key];

              return (
                <label
                  key={key}
                  htmlFor={`pref-${key}`}
                  className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 transition-colors hover:bg-panel"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-ink">
                      {label}
                    </span>
                    {!on && (
                      <span
                        id={hintId}
                        className="mt-0.5 block text-[11px] text-muted"
                      >
                        {hint}
                      </span>
                    )}
                  </span>

                  <Switch
                    id={`pref-${key}`}
                    checked={on}
                    onCheckedChange={(checked) => update(key, checked)}
                    disabled={disabled}
                    aria-describedby={!on ? hintId : undefined}
                    className="shrink-0"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
