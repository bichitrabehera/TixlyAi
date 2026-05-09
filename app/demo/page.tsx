"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Toast } from "@/components/Toast";
import { Header } from "@/components/Header";
import { InputPanel } from "@/components/InputPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { Slack } from "developer-icons";

const USAGE_LIMIT = 3;

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

export default function Demo() {
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
  const [slackToken, setSlackToken] = useState("");
  const [slackUserId, setSlackUserId] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check usage limit on mount
  useEffect(() => {
    const stored = localStorage.getItem("usage_count");
    const count = stored ? parseInt(stored, 10) : 0;
    setUsageCount(count);
  }, []);

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem("usage_count", newCount.toString());
  };

  const limitReached = usageCount >= USAGE_LIMIT;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2000);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("slack_connected") === "true") {
      setSlackConnected(true);
      showToast("Slack connected!");
      // Clean URL
      window.history.replaceState({}, "", "/demo");
    }
    if (params.get("error")) {
      showToast(params.get("error") || "Something went wrong");
      window.history.replaceState({}, "", "/demo");
    }

    // Check Slack connection status
    fetch("/api/slack/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.connected) {
          setSlackConnected(true);
          setSlackToken(data.accessToken || "");
          setSlackUserId(data.userId || "");
        }
      })
      .catch(() => {});
  }, []);

  const connectSlack = () => {
    const redirectUri = `${window.location.origin}/api/slack/callback`;
    const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || "your_client_id"}&scope=chat:write,im:write,im:read,users:read&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  };

  const sendToSlack = async () => {
    if (!ticket || !slackToken) return;
    setSlackLoading(true);
    setSlackSent(false);
    try {
      const response = await fetch("/api/slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ticket,
          accessToken: slackToken,
          userId: slackUserId,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send");
      }
      setSlackSent(true);
      showToast("Sent to Slack! ✅");
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

      const response = await fetch("/api/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocrText: text, note }),
      });

      if (!response.ok) throw new Error("Failed to generate ticket");

      const data = await response.json();
      setTicket(data.ticket);
      setStatus("");

      // Increment usage count
      if (!limitReached) {
        incrementUsage();
      }

      await copyTicketAndImage(data.ticket, img);
      showToast("Copied to clipboard!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, [image, note, limitReached, incrementUsage]);

  const handleFile = useCallback(
    (file: File) => {
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
    },
    [generateTicket],
  );

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
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        {/* Connect Tools Bar */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <span className="pl-3 text-sm font-medium text-slate-600">
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
                <Slack className="h-4 w-4" />
                Connect Slack
              </button>
            )}
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
      </main>

      <Toast message={toast} show={!!toast} />
    </div>
  );
}
