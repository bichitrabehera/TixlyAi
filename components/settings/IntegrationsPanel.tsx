"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";
import { SLACK_OAUTH_SCOPES } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4A154B] text-white">
            <Slack className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">Slack</p>
              {slackConnected && <StatusBadge connected />}
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Send tickets directly to your Slack DM
            </p>
          </div>
        </div>
        <div className="shrink-0">
          {slackConnected ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={disconnectSlack}
              disabled={disconnecting === "slack"}
            >
              {disconnecting === "slack" ? "Removing..." : "Disconnect"}
            </Button>
          ) : process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ? (
            <Button type="button" size="sm" onClick={connectSlack}>
              Connect Slack
            </Button>
          ) : null}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5E6AD2] text-white">
              <CgLinear className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">Linear</p>
                {linearConnected && <StatusBadge connected />}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Create issues from generated tickets
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {linearConnected && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={disconnectLinear}
                disabled={disconnecting === "linear"}
              >
                {disconnecting === "linear" ? "Removing..." : "Disconnect"}
              </Button>
            )}
          </div>
        </div>

        {!linearConnected && (
          <div className="mt-3 ml-12 space-y-2">
            <p className="text-xs text-muted">
              Create a Personal API Key in Linear → Settings → API, then paste
              it below.
            </p>
            <div className="flex gap-2">
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
                  "Save"
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
