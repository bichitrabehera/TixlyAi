"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";
import { SLACK_OAUTH_SCOPES } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function DisconnectButton({
  onClick,
  busy,
}: {
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-control-border bg-control px-3 text-xs font-medium text-destructive shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "Disconnecting…" : "Disconnect"}
    </button>
  );
}

function ConnectButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    >
      {children}
    </button>
  );
}

export function IntegrationsPanel() {
  const [slackConnected, setSlackConnected] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [linearKey, setLinearKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState<"slack" | "linear" | null>(
    null,
  );
  const [error, setError] = useState("");

  const loadStatus = useCallback(
    async (showSpinner: boolean, clearError = false) => {
      await Promise.resolve();
      if (clearError) setError("");
      if (showSpinner) setLoading(true);
      try {
        const [slack, linear] = await Promise.all([
          fetch("/api/slack/status").then((res) => res.json()),
          fetch("/api/integrations/linear/keys").then((res) => res.json()),
        ]);
        setSlackConnected(!!slack.connected);
        setLinearConnected(!!linear.connected);
      } catch {
        setError("Failed to load integration status");
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) void loadStatus(true, true);
    });
    return () => {
      cancelled = true;
    };
  }, [loadStatus]);

  const connectSlack = () => {
    if (!process.env.NEXT_PUBLIC_SLACK_CLIENT_ID) {
      setError(
        "Slack app isn't configured yet — add NEXT_PUBLIC_SLACK_CLIENT_ID and SLACK_CLIENT_ID (from your Slack app settings) to .env, then restart. See docs/setup-guide.md.",
      );
      return;
    }
    const redirectUri = `${window.location.origin}/api/slack/callback`;
    const state = crypto.randomUUID();
    document.cookie = `tixly_slack_state=${state}; Path=/api/slack/callback; Max-Age=600; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=${SLACK_OAUTH_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    window.location.href = url;
  };

  const disconnectSlack = async () => {
    setDisconnecting("slack");
    setError("");
    try {
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "slack" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to disconnect Slack");
      }
      loadStatus(false);
    } catch {
      setError("Failed to disconnect Slack");
    } finally {
      setDisconnecting(null);
    }
  };

  const disconnectLinear = async () => {
    setDisconnecting("linear");
    setError("");
    try {
      const res = await fetch("/api/integrations/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "linear" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to disconnect Linear");
      }
      loadStatus(false);
    } catch {
      setError("Failed to disconnect Linear");
    } finally {
      setDisconnecting(null);
    }
  };

  const saveLinearKey = async () => {
    if (!linearKey.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/integrations/linear/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: linearKey.trim() }),
      });
      if (res.ok) {
        setLinearKey("");
        loadStatus(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save Linear key");
      }
    } catch {
      setError("Failed to save Linear key");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-hairline bg-control p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4A154B] text-white">
            <Slack className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-ink">Slack</p>
              <StatusBadge connected={slackConnected} />
            </div>
            <p className="mt-0.5 text-xs text-muted">
              {slackConnected
                ? "Tickets can be sent to your Slack DM."
                : "Connect to send tickets directly to your Slack DM."}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {slackConnected ? (
            <DisconnectButton
              onClick={disconnectSlack}
              busy={disconnecting === "slack"}
            />
          ) : (
            <ConnectButton onClick={connectSlack}>Connect</ConnectButton>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-hairline bg-control p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5E6AD2] text-white">
              <CgLinear className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-ink">Linear</p>
                <StatusBadge connected={linearConnected} />
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {linearConnected
                  ? "Tickets can be pushed as Linear issues."
                  : "Connect to create issues from generated tickets."}
              </p>
            </div>
          </div>
          {linearConnected && (
            <div className="shrink-0">
              <DisconnectButton
                onClick={disconnectLinear}
                busy={disconnecting === "linear"}
              />
            </div>
          )}
        </div>

        {!linearConnected && (
          <div className="mt-3 space-y-2 sm:ml-12">
            <p className="text-xs text-muted">
              Create a Personal API Key in Linear → Settings → API, then paste
              it below.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="password"
                value={linearKey}
                onChange={(e) => setLinearKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveLinearKey()}
                placeholder="lin_api_..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={saveLinearKey}
                disabled={saving || !linearKey.trim()}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
