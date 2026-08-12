"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plug } from "lucide-react";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";
import { SLACK_OAUTH_SCOPES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ConnectIntegrationsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [slackConnected, setSlackConnected] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [linearKey, setLinearKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState<"slack" | "linear" | null>(
    null,
  );
  const [error, setError] = useState("");

  const loadStatus = (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    Promise.all([
      fetch("/api/slack/status").then((res) => res.json()),
      fetch("/api/integrations/linear/keys").then((res) => res.json()),
    ])
      .then(([slack, linear]) => {
        setSlackConnected(!!slack.connected);
        setLinearConnected(!!linear.connected);
      })
      .catch(() => setError("Failed to load integration status"))
      .finally(() => {
        if (showSpinner) setLoading(false);
      });
  };

  useEffect(() => {
    if (!open) return;
    setError("");
    loadStatus(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const connectSlack = () => {
    const redirectUri = `${window.location.origin}/api/slack/callback`;
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=${SLACK_OAUTH_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}`;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="h-4 w-4 text-[var(--muted)]" />
            Connect integrations
          </DialogTitle>
          <DialogDescription>
            Send generated tickets directly to Slack or Linear.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--muted)]" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4A154B] text-white">
                  <Slack className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text)]">
                      Slack
                    </p>
                    {slackConnected && (
                      <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-600">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Send tickets directly to your Slack DM
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                {slackConnected ? (
                  <button
                    type="button"
                    onClick={disconnectSlack}
                    disabled={disconnecting === "slack"}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium bg-red-500 transition hover:bg-red-500/90 disabled:opacity-50"
                  >
                    {disconnecting === "slack" ? "Removing..." : "Disconnect"}
                  </button>
                ) : process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ? (
                  <button
                    type="button"
                    onClick={connectSlack}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                  >
                    Connect Slack
                  </button>
                ) : null}
              </div>
            </div>

            <div className="border-t border-[var(--border)]" />

            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5E6AD2] text-white">
                    <CgLinear className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--text)]">
                        Linear
                      </p>
                      {linearConnected && (
                        <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-600">
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Create issues from generated tickets
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  {linearConnected && (
                    <button
                      type="button"
                      onClick={disconnectLinear}
                      disabled={disconnecting === "linear"}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium bg-red-500 transition hover:bg-red-500/90 disabled:opacity-50"
                    >
                      {disconnecting === "linear"
                        ? "Removing..."
                        : "Disconnect"}
                    </button>
                  )}
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
                      type="password"
                      value={linearKey}
                      onChange={(e) => setLinearKey(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveLinearKey()}
                      placeholder="lin_api_..."
                      className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                    />
                    <button
                      type="button"
                      onClick={saveLinearKey}
                      disabled={saving || !linearKey.trim()}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
