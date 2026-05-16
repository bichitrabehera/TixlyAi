"use client";

import { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import { Loader2 } from "lucide-react";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";

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
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID}&scope=chat:write,im:write,im:read,users:read&redirect_uri=${encodeURIComponent(redirectUri)}`;
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

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Slack */}
        <div className="rounded border border-(--border) bg-(--card) p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl  text-white text-lg">
                <Slack className="w-5 h-5" />{" "}
              </div>
              <div>
                <h3 className="text-base font-semibold text-(--text)">Slack</h3>
                <p className="mt-0.5 text-sm text-(--text)/50">
                  Send tickets to your Slack DM
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {slackConnected ? (
                <button
                  onClick={disconnectSlack}
                  disabled={disconnecting === "slack"}
                  className="rounded border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
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
                    className="rounded bg-(--text) px-5 py-2.5 text-sm font-medium text-(--card) transition-opacity hover:opacity-90"
                  >
                    Connect
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Linear */}
        <div className="rounded border border-(--border) bg-(--card) p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white text-lg">
                <CgLinear className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-(--text)">
                  Linear
                </h3>
                <p className="mt-0.5 text-sm text-(--text)/50">
                  Create Linear issues from tickets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {linearConnected && (
                <button
                  onClick={disconnectLinear}
                  disabled={disconnecting === "linear"}
                  className="rounded border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  {disconnecting === "linear" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Disconnect"
                  )}
                </button>
              )}
            </div>
          </div>

          {!linearConnected && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-(--text)/50">
                Paste your Linear personal API key. You can create one in Linear
                → Settings → API → Personal API Key.
              </p>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={linearKey}
                  onChange={(e) => setLinearKey(e.target.value)}
                  placeholder="lin_api_..."
                  className="flex-1 rounded border border-(--border) bg-(--bg) px-4 py-3 text-sm text-(--text) placeholder:text-(--text)/30 outline-none transition-all focus:border-(--primary)"
                />
                <button
                  onClick={saveLinearKey}
                  disabled={saving || !linearKey.trim()}
                  className="rounded-xl bg-(--text) px-5 py-3 text-sm font-medium text-(--card) transition-opacity hover:opacity-90 disabled:opacity-50"
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
