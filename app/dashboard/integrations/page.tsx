"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import { Loader2 } from "lucide-react";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";
import { SLACK_OAUTH_SCOPES } from "@/lib/constants";

export default function IntegrationsPage() {
  const [linearKey, setLinearKey] = useState("");
  const [linearConnected, setLinearConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

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

  useEffect(() => {
    checkStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get("slack_connected") === "true") {
      setSlackConnected(true);
      window.history.replaceState({}, "", "/dashboard/integrations");
    }
  }, []);

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

  return (
    <>
      <Header
        title="Integrations"
        subtitle="Connect your tools to send tickets directly"
      />

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Slack */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A154B] text-white">
                <Slack className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">
                  Slack
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Send tickets to your Slack DM
                </p>
              </div>
            </div>

            {slackConnected ? (
              <button
                onClick={disconnectSlack}
                disabled={disconnecting === "slack"}
                className="px-4 py-2 text-sm rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {disconnecting === "slack" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </button>
            ) : (
              process.env.NEXT_PUBLIC_SLACK_CLIENT_ID && (
                <button
                  onClick={connectSlack}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
                >
                  Connect
                </button>
              )
            )}
          </div>
        </div>

        {/* Linear */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5E6AD2] text-white">
                <CgLinear className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[var(--text)]">
                  Linear
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Create issues from tickets
                </p>
              </div>
            </div>

            {linearConnected && (
              <button
                onClick={disconnectLinear}
                disabled={disconnecting === "linear"}
                className="px-4 py-2 text-sm rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {disconnecting === "linear" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </button>
            )}
          </div>

          {!linearConnected && (
            <div className="mt-4 space-y-3">
              <p className="text-xs text-[var(--muted)]">
                Create a Personal API Key in Linear → Settings → API
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={linearKey}
                  onChange={(e) => setLinearKey(e.target.value)}
                  placeholder="lin_api_..."
                  className="flex-1 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button
                  onClick={saveLinearKey}
                  disabled={saving || !linearKey.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Connect"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
