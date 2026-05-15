"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Tesseract from "tesseract.js";
import { Toast } from "@/components/Toast";
import { InputPanel } from "@/components/InputPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { Slack } from "developer-icons";
import { History } from "lucide-react";
import Link from "next/link";
import Header from "@/components/dashboard/Header";

async function copyTicketAndImage(
  text: string,
  image: string | null,
): Promise<void> {
  if (image && "ClipboardItem" in window && navigator.clipboard?.write) {
    const response = await fetch(image);
    const blob = await response.blob();

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type || "image/png"]: blob,
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
    return;
  }

  await navigator.clipboard.writeText(text);
}

export default function DashboardGenerate() {
  const { user } = useUser();
  const [image, setImage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [slackLoading, setSlackLoading] = useState(false);
  const [slackSent, setSlackSent] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check Slack connection status
    fetch("/api/slack/status")
      .then((res) => res.json())
      .then((data) => {
        setSlackConnected(data.connected);
      })
      .catch(() => {});

    // Handle OAuth callback params
    const params = new URLSearchParams(window.location.search);
    if (params.get("slack_connected") === "true") {
      setSlackConnected(true);
      showToast("Slack connected!");
      window.history.replaceState({}, "", "/dashboard/generate");
    }
    if (params.get("error")) {
      showToast(params.get("error") || "Something went wrong");
      window.history.replaceState({}, "", "/dashboard/generate");
    }
  }, []);

  const checkUsageCount = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();

      if (data.tickets) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();

        const todayTickets = data.tickets.filter(
          (t: { createdAt: string }) =>
            new Date(t.createdAt) >= new Date(todayStart),
        );

        setUsageCount(todayTickets.length);
        setLimitReached(todayTickets.length >= 10);
      }
    } catch (e) {
      console.error("Failed to check usage", e);
    }
  }, []);

  useEffect(() => {
    checkUsageCount();
  }, [checkUsageCount]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  const connectSlack = () => {
    const clientId =
      process.env.NEXT_PUBLIC_SLACK_CLIENT_ID ||
      "11092752722018.11086391247955";
    const baseUrl = window.location.origin;
    const redirectUri = `${baseUrl}/api/slack/callback`;
    const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,im:write,im:read,users:read&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const sendToSlack = async () => {
    if (!ticket) return;
    setSlackLoading(true);
    setSlackSent(false);
    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ticket }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send");
      }
      setSlackSent(true);
      showToast("Sent to Slack!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send to Slack");
    } finally {
      setSlackLoading(false);
    }
  };

  const generateTicket = useCallback(async () => {
    const img = image;

    if (!img) {
      setError("Paste a screenshot first");
      return;
    }

    if (limitReached) {
      setError("Daily limit reached. Upgrade to Pro for unlimited tickets.");
      return;
    }

    setLoading(true);
    setStatus("Reading screenshot...");
    setError("");

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(img, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatus(`OCR ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      setStatus("Generating ticket...");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocrText: text, note, screenshotUrl: img }),
      });

      if (response.status === 429) {
        setLimitReached(true);
        setError("Daily limit reached. Upgrade to Pro for unlimited tickets.");
        setLoading(false);
        setStatus("");
        return;
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate ticket");
      }

      const data = await response.json();
      setTicket(data.ticket);
      setStatus("");

      await copyTicketAndImage(data.ticket, img);
      showToast("Copied to clipboard!");

      checkUsageCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, [image, note, limitReached, checkUsageCount]);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = e.target?.result as string;
        setImage(img);
        setTicket("");
        setSlackSent(false);
        setStatus("");
      };
      reader.readAsDataURL(file);
      setError("");
    }
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const copyToClipboard = async () => {
    if (!ticket) return;
    try {
      await copyTicketAndImage(ticket, image);
      showToast(image ? "Copied image and ticket!" : "Copied ticket!");
    } catch {
      await navigator.clipboard.writeText(ticket);
      showToast("Copied ticket!");
    }
  };

  const reset = () => {
    setImage(null);
    setNote("");
    setTicket("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <Header
          title="Generate Ticket"
          subtitle="Convert screenshots into structured tickets"
        >
          <Link
            href="/dashboard/history"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
    bg-[var(--card)] border border-[var(--border)] 
    text-[var(--text)]/80 hover:bg-[var(--card-2)] transition"
          >
            <History className="w-4 h-4" />
            History
          </Link>
        </Header>

        <div className="mb-6">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1.5 shadow-sm">
            <span className="pl-3 text-sm font-medium text-[var(--text)]/60">
              Connect:
            </span>

            {slackConnected ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <Slack className="h-4 w-4" />
                connected
              </div>
            ) : (
              <button
                onClick={connectSlack}
                className="inline-flex items-center gap-2 rounded-full bg-[#4A154B] px-5 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Connect <Slack className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-3 text-sm text-[var(--text)]/60">
            Usage today: {usageCount}/10 (Free plan)
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <InputPanel
            image={image}
            note={note}
            loading={loading}
            status={status}
            error={error}
            fileInputRef={fileInputRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClickDropzone={() => fileInputRef.current?.click()}
            onRemoveImage={() => setImage(null)}
            onNoteChange={setNote}
            onGenerate={() => generateTicket()}
            onFileChange={handleFileChange}
            limitReached={limitReached}
          />

          <OutputPanel
            ticket={ticket}
            onCopy={copyToClipboard}
            onReset={reset}
            onSendToSlack={sendToSlack}
            slackLoading={slackLoading}
            slackSent={slackSent}
            slackConnected={slackConnected}
            disabled={!ticket || loading}
          />
        </div>
      </div>

      <Toast message={toast} show={!!toast} />
    </div>
  );
}
