"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionCard } from "./SectionCard";
import type { SettingsData } from "./types";

export function NotificationsSection({
  settings,
  onUpdate,
  showMessage,
}: {
  settings: SettingsData;
  onUpdate: () => void;
  showMessage: (type: "success" | "error", message: string) => void;
}) {
  const [enabled, setEnabled] = useState(settings.notificationEmail);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (value: boolean) => {
    setSaving(true);
    setEnabled(value);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: value }),
      });
      if (res.ok) {
        showMessage(
          "success",
          value
            ? "Email notifications enabled"
            : "Email notifications disabled",
        );
        onUpdate();
      }
    } catch {
      setEnabled(!value);
      showMessage("error", "Failed to update notifications");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Notifications" description="Manage email preferences.">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor="email-summaries" className="text-sm font-medium">
            Email summaries
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Receive periodic summaries of your generated tickets
          </p>
        </div>
        <Switch
          id="email-summaries"
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={saving}
        />
      </div>
    </SectionCard>
  );
}
