"use client";

import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsDialog } from "@/components/settings/SettingsDialogProvider";

export function NoAiKeyCard() {
  const { openSettings } = useSettingsDialog();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card px-8 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Connect an AI provider to start generating tickets
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Bring your own key — OpenAI, OpenRouter or Anthropic — from Settings.
            Keys are encrypted and never leave the server.
          </p>
        </div>
        <Button
          type="button"
          onClick={openSettings}
          className="mt-1 h-9 gap-1.5 rounded-md px-4 text-sm font-medium"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          Connect API key
        </Button>
      </div>
    </div>
  );
}
