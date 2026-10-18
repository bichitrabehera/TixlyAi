"use client";

import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export function NoAiKeyCard() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100dvh-6rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-hairline bg-panel-soft px-6 py-10 text-center sm:px-8">
        <span className="flex size-11 items-center justify-center rounded-full border border-control-border bg-control text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            Add your AI key to start generating
          </h2>
          <p className="text-sm leading-6 text-muted">
            Tixly is free — no subscription, no paid tier. Bring your own
            OpenAI, OpenRouter or Anthropic key from Settings and use it
            directly.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => router.push(`${ROUTES.settings}?section=ai`)}
          className="mt-1 h-9 gap-1.5 rounded-lg px-4 text-xs font-medium"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          Add API key
        </Button>
      </div>
    </div>
  );
}
