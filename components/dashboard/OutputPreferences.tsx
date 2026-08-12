"use client";

import { DETAIL_LEVELS } from "@/lib/constants";

export type OutputPreferencesValue = {
  detailLevel: (typeof DETAIL_LEVELS)[number];
  includeReproSteps: boolean;
  detectSeverity: boolean;
  detectComponent: boolean;
  includeTechnicalContext: boolean;
};

type BoolKey =
  | "includeReproSteps"
  | "detectSeverity"
  | "detectComponent"
  | "includeTechnicalContext";

interface OutputPreferencesProps {
  value: OutputPreferencesValue;
  onChange: (value: OutputPreferencesValue) => void;
}

const TOGGLES: { key: BoolKey; label: string }[] = [
  { key: "includeReproSteps", label: "Include reproduction steps" },
  { key: "detectSeverity", label: "Detect severity" },
  { key: "detectComponent", label: "Detect affected component" },
  { key: "includeTechnicalContext", label: "Include technical context" },
];

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
    >
      <span className="text-sm text-foreground">{label}</span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary/50" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-primary-foreground shadow transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function OutputPreferences({ value, onChange }: OutputPreferencesProps) {
  const update = (key: BoolKey, checked: boolean) =>
    onChange({ ...value, [key]: checked });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Output preferences
        </span>
        <span className="text-xs text-muted-foreground/60">( optional )</span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="px-1 pb-2 text-[11px] font-medium text-muted-foreground">
          Detail level
        </p>

        <div className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
          {DETAIL_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ ...value, detailLevel: level })}
              className={
                value.detailLevel === level
                  ? "rounded-lg bg-primary/50 py-1.5 text-xs font-medium text-primary-foreground shadow-sm"
                  : "rounded-lg py-1.5 text-xs font-medium capitalize text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {level}
            </button>
          ))}
        </div>

        <div className="mt-2 divide-y divide-border">
          {TOGGLES.map(({ key, label }) => (
            <ToggleRow
              key={key}
              label={label}
              checked={value[key]}
              onChange={(checked) => update(key, checked)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
