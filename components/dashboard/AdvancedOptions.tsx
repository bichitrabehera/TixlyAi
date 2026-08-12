"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PRIORITIES } from "@/lib/constants";

type Priority = (typeof PRIORITIES)[number];

interface AdvancedOptionsProps {
  priority: Priority | undefined;
  onPriorityChange: (value: Priority | undefined) => void;
  manualOcrText: string;
  onManualOcrChange: (value: string) => void;
  disabled?: boolean;
}

export function AdvancedOptions({
  priority,
  onPriorityChange,
  manualOcrText,
  onManualOcrChange,
  disabled = false,
}: AdvancedOptionsProps) {
  const [open, setOpen] = useState(false);

  const priorityClass = (current: Priority | undefined) =>
    current === priority
      ? "rounded-lg bg-primary py-1.5 text-[11px] font-medium text-primary-foreground shadow-sm"
      : "rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
      >
        <span className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Advanced</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            (optional)
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">
              Priority override
            </p>
            <div className="grid grid-cols-5 gap-1 rounded-xl bg-secondary p-1">
              <button
                type="button"
                onClick={() => onPriorityChange(undefined)}
                className={priorityClass(undefined)}
              >
                Auto
              </button>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    onPriorityChange(priority === p ? undefined : p)
                  }
                  className={priorityClass(p)}
                >
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">
              Paste text instead of a screenshot
            </p>
            <textarea
              value={manualOcrText}
              onChange={(e) => onManualOcrChange(e.target.value)}
              disabled={disabled}
              rows={4}
              placeholder="Paste the on-screen text from the screenshot here…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
