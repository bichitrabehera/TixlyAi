"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  ShieldCheck,
} from "lucide-react";

interface SettingsData {
  name: string;
  email: string;
  aiProvider: string | null;
  hasAiKey: boolean;
  notificationEmail: boolean;
}

function getProviderDisplay(provider: string | null) {
  switch (provider) {
    case "openai":
      return { name: "OpenAI", badge: "GPT-4o Mini" };
    case "openrouter":
      return { name: "OpenRouter", badge: "Auto-select" };
    case "anthropic":
      return { name: "Anthropic", badge: "Claude Sonnet" };
    default:
      return { name: "Not configured", badge: "" };
  }
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-4 ${
        connected
          ? "bg-green-500/10 text-green-600"
          : "bg-[var(--border)] text-[var(--muted)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected ? "bg-green-500" : "bg-current opacity-40"
        }`}
      />
      {connected ? "Connected" : "Disconnected"}
    </span>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [settings, setSettings] = useState<SettingsData>({
    name: "",
    email: "",
    aiProvider: null,
    hasAiKey: false,
    notificationEmail: false,
  });

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) setSettings(await res.json());
    } catch {
      showMessage("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setSettings(data);
      })
      .catch(() => showMessage("error", "Failed to load settings"))
      .finally(() => setLoading(false));
  }, [showMessage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-(--muted)" />
      </div>
    );
  }

  return (
    <>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="mx-auto w-full max-w-2xl min-w-0 py-8">
        {message && (
          <div
            className={`mb-6 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-500/20 bg-green-500/[0.04] text-green-600"
                : "border-[var(--border)] bg-[var(--border)]/30 text-[var(--muted)]"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          <AiProviderSection
            settings={settings}
            onUpdate={fetchSettings}
            showMessage={showMessage}
          />
          <NotificationsSection
            settings={settings}
            onUpdate={fetchSettings}
            showMessage={showMessage}
          />
          <AccountSection
            showMessage={showMessage}
          />
        </div>
      </div>
    </>
  );
}

function SectionCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden ${className}`}
    >
      <div className="px-5 pt-5 pb-4 border-b border-[var(--border)]">
        <div className="flex items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--text)]">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm leading-5 text-[var(--muted)]">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function AiProviderSection({
  settings,
  onUpdate,
  showMessage,
}: {
  settings: SettingsData;
  onUpdate: () => void;
  showMessage: (t: "success" | "error", m: string) => void;
}) {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const provider = getProviderDisplay(settings.aiProvider);

  const handleSave = async () => {
    if (!key.trim()) return;
    setTesting(true);
    try {
      const res = await fetch("/api/settings/ai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showMessage("success", data.message || "API key saved");
        setKey("");
        onUpdate();
      } else {
        showMessage("error", data.error || "Failed to save API key");
      }
    } catch {
      showMessage("error", "Failed to save API key");
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch("/api/settings/ai-key", { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "API key removed");
        onUpdate();
      }
    } catch {
      showMessage("error", "Failed to remove API key");
    }
  };

  return (
    <SectionCard
      title="AI Provider"
      description="Connect your preferred AI provider."
    >
      {settings.hasAiKey ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-500/15 bg-green-500/[0.03] px-4 py-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--text)]">
                  {provider.name}
                </p>
                <p className="text-xs text-green-600">
                  Active · {provider.badge}
                </p>
              </div>
            </div>
            <StatusBadge connected />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              className="h-auto gap-1.5 px-3.5 py-2 text-sm font-medium"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove key
            </Button>
            <a
              href="/docs#ai-provider-key"
              className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-green-600 transition-colors"
            >
              How to get a key
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-... / sk-or-v1-... / sk-ant-..."
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-transparent pl-3 pr-10 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={testing || !key.trim()}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {testing ? "Testing..." : "Save API key"}
            </button>
            <span className="text-xs text-[var(--muted)]">
              Auto-detects provider from key prefix
            </span>
          </div>

          <a
            href="/docs#ai-provider-key"
            className="mt-1 inline-flex items-center gap-1 text-xs text-green-600 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            How to get an API key
          </a>
        </div>
      )}
    </SectionCard>
  );
}

function NotificationsSection({
  settings,
  onUpdate,
  showMessage,
}: {
  settings: SettingsData;
  onUpdate: () => void;
  showMessage: (t: "success" | "error", m: string) => void;
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text)]">
            Email summaries
          </p>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Receive periodic summaries of your generated tickets
          </p>
        </div>
        <label className="relative cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={saving}
            className="sr-only peer"
          />
          <div className="h-6 w-10 rounded-full bg-[var(--border)] transition-colors peer-checked:bg-[var(--primary)]" />
          <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4" />
        </label>
      </div>
    </SectionCard>
  );
}

function AccountSection({
  showMessage,
}: {
  showMessage: (t: "success" | "error", m: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "Account data deleted");
        window.location.href = "/";
      }
    } catch {
      showMessage("error", "Failed to delete account data");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SectionCard title="Account" description="Manage your account data.">
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3.5 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete account data
        </button>
      ) : (
        <div className="rounded-lg border border-red-500/15 bg-red-500/[0.03] px-4 py-3.5 space-y-3">
          <p className="text-sm font-medium text-red-500">Are you sure?</p>
          <p className="text-xs leading-5 text-[var(--muted)]">
            This permanently deletes all your tickets and data from Tixly. Your
            Clerk account will not be affected. This action cannot be undone.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              {deleting ? "Deleting..." : "Yes, delete everything"}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
