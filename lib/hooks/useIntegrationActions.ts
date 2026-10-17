"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ticketToPlainText } from "@/lib/tickets/format";
import { ROUTES } from "@/lib/routes";

interface UseIntegrationActionsOptions {
  ticket: string;
  uploadCount?: number;
  onError?: (message: string) => void;
}

export function useIntegrationActions({
  ticket,
  uploadCount = 0,
  onError,
}: UseIntegrationActionsOptions) {
  const [slackLoading, setSlackLoading] = useState(false);
  const [slackSent, setSlackSent] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [linearLoading, setLinearLoading] = useState(false);
  const [linearSent, setLinearSent] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [prevUploadCount, setPrevUploadCount] = useState(uploadCount);

  if (uploadCount !== prevUploadCount) {
    setPrevUploadCount(uploadCount);
    if (uploadCount > 0) setSlackSent(false);
  }

  useEffect(() => {
    fetch("/api/slack/status")
      .then((res) => res.json())
      .then((data) => setSlackConnected(data.connected))
      .catch(() => {});

    fetch("/api/integrations/linear/keys")
      .then((res) => res.json())
      .then((data) => setLinearConnected(data.connected))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("slack_connected") === "true";
    const err = params.get("error");
    if (!connected && !err) return;

    window.history.replaceState({}, "", ROUTES.generate);
    const timer = setTimeout(() => {
      if (connected) {
        toast.success("Slack connected!");
      } else if (err) {
        toast.error(err);
        onError?.(err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [onError]);

  const sendToSlack = useCallback(async () => {
    if (!ticket) return;
    setSlackLoading(true);
    setSlackSent(false);
    try {
      const text = ticketToPlainText(ticket);
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send");
      }
      setSlackSent(true);
      toast.success("Sent to Slack!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send to Slack",
      );
    } finally {
      setSlackLoading(false);
    }
  }, [ticket]);

  const sendToLinear = useCallback(async () => {
    if (!ticket) return;
    setLinearLoading(true);
    setLinearSent(false);
    try {
      const response = await fetch("/api/integrations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "linear", ticketText: ticket }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to send");
      }
      setLinearSent(true);
      toast.success("Sent to Linear!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send to Linear",
      );
    } finally {
      setLinearLoading(false);
    }
  }, [ticket]);

  return {
    slackLoading,
    slackSent,
    slackConnected,
    linearLoading,
    linearSent,
    linearConnected,
    sendToSlack,
    sendToLinear,
  };
}
