"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/dashboard/Header";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Puzzle,
  CreditCard,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  LogOut,
  ChevronRight,
  Zap,
  ShieldCheck,
  Bell,
  Key,
} from "lucide-react";
import { SLACK_OAUTH_SCOPES, MONTHLY_LIMIT_FREE } from "@/lib/constants";

const providerMeta = {
  openai: { name: "OpenAI", badge: "GPT-4o Mini" },
  openrouter: { name: "OpenRouter", badge: "Auto-select" },
  anthropic: { name: "Anthropic", badge: "Claude Sonnet" },
} as const;

function getProviderDisplay(provider: string | null) {
  switch (provider) {
    case "openai":
      return { name: "OpenAI", badge: "GPT-4o Mini", color: "text-green-600" };
    case "openrouter":
      return {
        name: "OpenRouter",
        badge: "Auto-select",
        color: "text-blue-600",
      };
    case "anthropic":
      return {
        name: "Anthropic",
        badge: "Claude Sonnet",
        color: "text-orange-600",
      };
    default:
      return {
        name: "Not configured",
        badge: "",
        color: "text-[var(--muted)]",
      };
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

  const [settings, setSettings] = useState({
    name: "",
    email: "",
    plan: "free",
    planName: "Free",
    aiProvider: null as string | null,
    hasAiKey: false,
    notificationEmail: false,
    hasSlack: false,
    hasLinear: false,
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
    fetchSettings();
  }, [fetchSettings]);

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
                : "border-red-500/20 bg-red-500/[0.04] text-red-500"
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
          <IntegrationsSection
            settings={settings}
            onUpdate={fetchSettings}
            showMessage={showMessage}
          />
          <PlanSection
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
            settings={settings}
            onUpdate={fetchSettings}
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
  settings: any;
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
            <button
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3.5 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove key
            </button>
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

function IntegrationsSection({
  settings,
  onUpdate,
  showMessage,
}: {
  settings: any;
  onUpdate: () => void;
  showMessage: (t: "success" | "error", m: string) => void;
}) {
  const [linearKey, setLinearKey] = useState("");
  const [linearConnected, setLinearConnected] = useState(settings.hasLinear);
  const [slackConnected, setSlackConnected] = useState(settings.hasSlack);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get("slack_connected") === "true") {
      setSlackConnected(true);
      window.history.replaceState({}, "", "/dashboard/settings");
    }
  }, []);

  const checkStatus = () => {
    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((d) => setSlackConnected(d.connected))
      .catch(() => {});
    fetch("/api/integrations/linear/keys")
      .then((r) => r.json())
      .then((d) => setLinearConnected(d.connected))
      .catch(() => {});
  };

  const connectSlack = () => {
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/slack/callback`;
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=${SLACK_OAUTH_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const disconnectSlack = async () => {
    setDisconnecting("slack");
    try {
      await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "slack" }),
      });
      setSlackConnected(false);
    } finally {
      setDisconnecting(null);
    }
  };

  const disconnectLinear = async () => {
    setDisconnecting("linear");
    try {
      await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "linear" }),
      });
      setLinearConnected(false);
    } finally {
      setDisconnecting(null);
    }
  };

  const saveLinearKey = async () => {
    if (!linearKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/integrations/linear/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: linearKey.trim() }),
      });
      if (res.ok) {
        setLinearConnected(true);
        setLinearKey("");
      }
    } finally {
      setSaving(false);
    }
  };

  const isPro = settings.plan === "pro";

  return (
    <SectionCard
      title="Integrations"
      description="Connect Slack and Linear to export tickets directly."
    >
      {!isPro ? (
        <div className="flex items-start gap-4 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--border)]">
            <Zap className="h-4 w-4 text-[var(--muted)]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--text)]">
              Pro feature
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
              Upgrade to Pro to connect Slack and Linear. Free plan includes
              clipboard copy only.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById("plan-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:underline"
            >
              <CreditCard className="h-3 w-3" />
              View plans
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Slack Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4A154B] text-white">
                <Slack className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--text)]">
                    Slack
                  </p>
                  <StatusBadge connected={slackConnected} />
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Send tickets directly to your Slack DM
                </p>
                <a
                  href="/docs#slack"
                  className="inline-flex items-center gap-0.5 text-xs text-green-600 hover:underline mt-1"
                >
                  Setup guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="shrink-0">
              {slackConnected ? (
                <button
                  onClick={disconnectSlack}
                  disabled={disconnecting === "slack"}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  {disconnecting === "slack" ? "Removing..." : "Disconnect"}
                </button>
              ) : process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ? (
                <button
                  onClick={connectSlack}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                >
                  Connect
                  <ChevronRight className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border)]" />

          {/* Linear Row */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5E6AD2] text-white">
                  <CgLinear className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text)]">
                      Linear
                    </p>
                    <StatusBadge connected={linearConnected} />
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Create issues from generated tickets
                  </p>
                  <a
                    href="/docs#linear"
                    className="inline-flex items-center gap-0.5 text-xs text-green-600 hover:underline mt-1"
                  >
                    Setup guide
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="shrink-0">
                {linearConnected ? (
                  <button
                    onClick={disconnectLinear}
                    disabled={disconnecting === "linear"}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {disconnecting === "linear" ? "Removing..." : "Disconnect"}
                  </button>
                ) : null}
              </div>
            </div>

            {!linearConnected && (
              <div className="mt-3 ml-12 space-y-2">
                <p className="text-xs text-[var(--muted)]">
                  Create a Personal API Key in Linear → Settings → API, then
                  paste it below.
                </p>
                <div className="flex gap-2">
                  <input
                    id="linear-input"
                    type="password"
                    value={linearKey}
                    onChange={(e) => setLinearKey(e.target.value)}
                    placeholder="lin_api_..."
                    className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                  />
                  <button
                    onClick={saveLinearKey}
                    disabled={saving || !linearKey.trim()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Connect"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function PlanSection({
  settings,
  onUpdate,
  showMessage,
}: {
  settings: any;
  onUpdate: () => void;
  showMessage: (t: "success" | "error", m: string) => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/cancel-subscription", {
        method: "POST",
      });
      if (res.ok) {
        showMessage("success", "Subscription cancelled");
        setShowCancelConfirm(false);
        onUpdate();
      } else {
        const data = await res.json();
        showMessage("error", data.error || "Failed to cancel");
      }
    } catch {
      showMessage("error", "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <SectionCard
      title="Plan"
      description="Your current subscription and billing."
    >
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
            settings.plan === "pro"
              ? "bg-blue-500/10 text-blue-600"
              : "bg-[var(--border)] text-[var(--muted)]"
          }`}
        >
          {settings.plan === "pro" && <Zap className="h-3 w-3" />}
          {settings.planName}
        </span>
        {settings.plan === "free" && (
          <span className="text-xs text-[var(--muted)]">
            {MONTHLY_LIMIT_FREE} tickets / month
          </span>
        )}
        {settings.plan === "pro" && (
          <span className="text-xs text-green-600">Unlimited tickets</span>
        )}
      </div>

      {settings.plan === "free" ? (
        <div className="rounded-lg border border-[var(--primary)]/15 bg-[var(--primary)]/[0.03] px-4 py-3.5">
          <p className="text-sm leading-6 text-[var(--text)]">
            Upgrade to Pro for unlimited ticket generation, Slack and Linear
            integrations, and priority support.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:opacity-90">
              <Zap className="h-4 w-4" />
              Upgrade to Pro — $5/mo
            </button>
            <a
              href="/docs#plans-billing"
              className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-green-600 transition-colors"
            >
              About plans & billing
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : (
        <div>
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3.5 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cancel subscription
            </button>
          ) : (
            <div className="rounded-lg border border-red-500/15 bg-red-500/[0.03] px-4 py-3.5 space-y-3">
              <p className="text-sm font-medium text-red-500">
                Cancel your subscription?
              </p>
              <p className="text-xs text-[var(--muted)]">
                Your subscription will stop renewing at the end of the current
                billing period. You will still have Pro access until then.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                >
                  {cancelling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                  {cancelling ? "Cancelling..." : "Yes, cancel"}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  Keep Pro
                </button>
              </div>
            </div>
          )}
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
  settings: any;
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
  settings,
  onUpdate,
  showMessage,
}: {
  settings: any;
  onUpdate: () => void;
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
