"use client";

import { ShieldAlert, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function GuardrailNotice({
  level = "warn",
  message,
  className,
}: {
  level?: "info" | "warn";
  message: string;
  className?: string;
}) {
  const isWarn = level === "warn";

  return (
    <Alert
      className={cn(
        "animate-fade-up",
        isWarn
          ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
          : "border-primary/25 bg-primary/5 text-primary [&>svg]:text-current",
        className,
      )}
    >
      {isWarn ? (
        <ShieldAlert aria-hidden />
      ) : (
        <Sparkles aria-hidden />
      )}
      <AlertDescription className="text-current">
        {message}
      </AlertDescription>
    </Alert>
  );
}

export function NeedsReviewBanner({ className }: { className?: string }) {
  return (
    <Alert
      className={cn(
        "animate-fade-up border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        className,
      )}
    >
      <ShieldAlert aria-hidden />
      <AlertTitle className="text-current">Flagged for human review</AlertTitle>
      <AlertDescription className="text-current/80">
        A guardrail or the model was not confident in some fields. Double-check
        the ticket before sending it anywhere.
      </AlertDescription>
    </Alert>
  );
}
