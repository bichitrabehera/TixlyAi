"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
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

export function SettingsPage() {
  const searchParams = useSearchParams();
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
    const t = setTimeout(() => void fetchSettings(), 0);
    return () => clearTimeout(t);
  }, [fetchSettings]);

  const section = searchParams.get("section");
  useEffect(() => {
    if (!section) return;
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  }, [section]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-10">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Settings
        </h1>
        <p className="text-sm text-muted">
          Tixly is bring-your-own-key — no subscription, no paid tier. Add the
          AI key you already have and use it directly.
        </p>
      </header>

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

      <div id="ai" className="scroll-mt-4">
        <SectionCard
          title="AI keys"
          description="Connect the providers you use. Your keys are encrypted at rest and only used server-side, per request."
        >
          <ApiKeysPanel onChanged={fetchSettings} />
        </SectionCard>
      </div>

      <div id="integrations" className="scroll-mt-4">
        <SectionCard
          title="Integrations"
          description="Send generated tickets directly to Slack or Linear. Connect when you need them, disconnect anytime."
        >
          <IntegrationsPanel />
        </SectionCard>
      </div>

      <div id="notifications" className="scroll-mt-4">
        <NotificationsSection
          key={String(settings.notificationEmail)}
          settings={settings}
          onUpdate={fetchSettings}
          showMessage={showMessage}
        />
      </div>

      <div id="account" className="scroll-mt-4">
        <AccountSection showMessage={showMessage} />
      </div>
    </div>
  );
}
