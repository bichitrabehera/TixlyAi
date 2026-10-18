"use client";

import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { DETAIL_LEVELS, DETAIL_LEVEL_META } from "@/lib/constants";

export type OutputPreferencesValue = {
  detailLevel: (typeof DETAIL_LEVELS)[number];
  includeReproSteps: boolean;
  detectSeverity: boolean;
  detectComponent: boolean;
  includeTechnicalContext: boolean;
};

interface DetailLevelControlProps {
  value: OutputPreferencesValue["detailLevel"];
  onChange: (value: OutputPreferencesValue["detailLevel"]) => void;
  disabled?: boolean;
}

export function DetailLevelControl({
  value,
  onChange,
  disabled = false,
}: DetailLevelControlProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">Verbosity</span>
      </div>

      <SegmentedControl
        value={value}
        onChange={onChange}
        options={DETAIL_LEVELS.map((level) => ({
          value: level,
          label: DETAIL_LEVEL_META[level].label,
          title: DETAIL_LEVEL_META[level].hint,
        }))}
        ariaLabel="Output verbosity"
        disabled={disabled}
      />

      <p className="text-[11px] text-muted-foreground">
        {DETAIL_LEVEL_META[value].hint}
      </p>
    </section>
  );
}
