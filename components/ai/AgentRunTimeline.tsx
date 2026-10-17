"use client";

import { Check, Circle, FileText, ScanEye, ShieldCheck, Wrench, X } from "lucide-react";
import type { StreamStep, StreamStepStatus } from "@/lib/ai/stream-types";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  validate: ShieldCheck,
  analyze: ScanEye,
  tools: Wrench,
  draft: FileText,
  validate_output: ShieldCheck,
  fallback: ScanEye,
};

function StepIcon({
  id,
  status,
}: {
  id: string;
  status: StreamStepStatus;
}) {
  const Icon = STEP_ICONS[id] ?? Circle;

  if (status === "running") {
    return (
      <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary animate-pulse-ring">
        <Spinner className="size-3" />
      </span>
    );
  }

  if (status === "done") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
        <Check className="size-3.5" />
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
        <X className="size-3.5" />
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground/50">
      <Icon className="size-3" />
    </span>
  );
}

export function AgentRunTimeline({
  steps,
  className,
}: {
  steps: StreamStep[];
  className?: string;
}) {
  if (steps.length === 0) return null;

  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const active = step.status === "running";

        return (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "absolute left-3 top-7 h-[calc(100%-1.5rem)] w-px -translate-x-1/2",
                  step.status === "done" ? "bg-primary/40" : "bg-border",
                )}
              />
            )}

            <StepIcon id={step.id} status={step.status} />

            <div className="flex min-w-0 flex-col pt-0.5">
              <span
                className={cn(
                  "text-sm leading-tight",
                  active
                    ? "font-medium text-foreground"
                    : step.status === "pending"
                      ? "text-muted-foreground/50"
                      : "text-muted-foreground",
                )}
              >
                {step.status === "running" ? (
                  <span className="shimmer-text">{step.label}…</span>
                ) : (
                  step.label
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
