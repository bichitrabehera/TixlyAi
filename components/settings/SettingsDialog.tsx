"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountSection } from "./AccountSection";
import { ApiKeysPanel } from "./ApiKeysPanel";
import { IntegrationsPanel } from "./IntegrationsPanel";
import { NotificationsSection } from "./NotificationsSection";
import { SectionCard } from "./SectionCard";
import type { SettingsData } from "./types";

type Message = { type: "success" | "error"; text: string };

const DEFAULT_SETTINGS: SettingsData = {
  name: "",
  email: "",
  aiProvider: null,
  hasAiKey: false,
  notificationEmail: false,
};

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<Message | null>(null);

  const showMessage = useCallback((type: Message["type"], text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setSettings(await res.json());
    } catch {
      showMessage("error", "Failed to load settings");
    }
  }, [showMessage]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      void fetchSettings();
    }, 0);
    return () => clearTimeout(t);
  }, [open, fetchSettings]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 text-left">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your API keys, integrations, notifications, and account.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={
                message.type === "success"
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : undefined
              }
            >
              {message.type === "success" ? <CheckCircle /> : <XCircle />}
              <div className="col-start-2 text-sm">{message.text}</div>
            </Alert>
          )}

          <SectionCard
            title="AI keys"
            description="Connect the providers you use. The model is fixed per provider."
          >
            <ApiKeysPanel onChanged={fetchSettings} />
          </SectionCard>

          <SectionCard
            title="Integrations"
            description="Send generated tickets directly to Slack or Linear."
          >
            <IntegrationsPanel />
          </SectionCard>

          <NotificationsSection
            key={String(settings.notificationEmail)}
            settings={settings}
            onUpdate={fetchSettings}
            showMessage={showMessage}
          />

          <AccountSection showMessage={showMessage} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
