"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Toast } from "@/components/Toast";
import { InputPanel } from "@/components/InputPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { History, Key, Loader2 } from "lucide-react";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import { ticketToPlainText } from "@/lib/tickets/format";
import {
  MONTHLY_LIMIT_FREE,
  SESSION_KEY,
  TOAST_DISMISS_MS,
  OCR_LANGUAGE,
} from "@/lib/constants";

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

function saveSession(image: string | null, ticket: string, note: string) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ image, ticket, note }));
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

interface SessionData {
  image: string | null;
  ticket: string;
  note: string;
}

function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function DashboardGenerate() {
  const [image, setImage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [ocrFailed, setOcrFailed] = useState(false);
  const [manualOcrText, setManualOcrText] = useState("");
  const [toast, setToast] = useState("");
  const [slackLoading, setSlackLoading] = useState(false);
  const [slackSent, setSlackSent] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [linearLoading, setLinearLoading] = useState(false);
  const [linearSent, setLinearSent] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [monthlyLimit, setMonthlyLimit] = useState(MONTHLY_LIMIT_FREE);
  const [plan, setPlan] = useState("free");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasAiKey, setHasAiKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setHasAiKey(data.hasAiKey);
      })
      .catch(() => setHasAiKey(false));
  }, []);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      setImage(session.image);
      setNote(session.note);
      setTicket(session.ticket);
    }
  }, []);

  useEffect(() => {
    if (ticket || image || note) {
      saveSession(image, ticket, note);
    }
  }, [image, ticket, note]);

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

  const checkUsageCount = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();

      if (data.usage) {
        setMonthlyLimit(data.usage.monthlyLimit);
        setUsageCount(data.usage.monthlyUsage);
        setLimitReached(data.usage.monthlyUsage >= data.usage.monthlyLimit);
        setPlan(data.usage.plan);
      }
    } catch (e) {
      console.error("Failed to check usage", e);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      checkUsageCount();
    }, 0);
  }, [checkUsageCount]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), TOAST_DISMISS_MS);
  };

  const sendToSlack = async () => {
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
      showToast("Sent to Slack!");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send to Slack");
    } finally {
      setSlackLoading(false);
    }
  };

  const sendToLinear = async () => {
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
      showToast("Sent to Linear!");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to send to Linear",
      );
    } finally {
      setLinearLoading(false);
    }
  };

  const uploadImage = async (base64Data: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: base64Data }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.url;
    } catch {
      return null;
    }
  };

  const generateTicket = useCallback(async () => {
    const img = image;
    const useText = manualOcrText || null;

    if (!img && !useText) {
      setError("Paste a screenshot first or enter text manually");
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
      let text = useText;

      if (!text && img) {
        let ocrSource = img;
        if (img.startsWith("http")) {
          const blob = await fetch(img).then((r) => r.blob());
          ocrSource = URL.createObjectURL(blob);
        }

        try {
          const {
            data: { text: ocrText },
          } = await Tesseract.recognize(ocrSource, OCR_LANGUAGE, {
            logger: (m) => {
              if (m.status === "recognizing text") {
                setStatus(`OCR ${Math.round(m.progress * 100)}%`);
              }
            },
          });
          text = ocrText;
          setOcrFailed(false);

          if (ocrSource !== img) {
            URL.revokeObjectURL(ocrSource);
          }
        } catch {
          setOcrFailed(true);
          setLoading(false);
          setStatus("");
          setError("OCR failed. Please paste text manually below.");
          return;
        }
      }

      setStatus("Uploading image...");
      let screenshotUrl: string | null = null;

      if (img?.startsWith("data:") || img?.startsWith("blob:")) {
        screenshotUrl = await uploadImage(img);
      } else if (img) {
        screenshotUrl = img;
      }

      setStatus("Generating ticket...");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ocrText: text,
          note,
          screenshotUrl,
        }),
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

      if (data.remaining !== undefined) {
        setUsageCount(MONTHLY_LIMIT_FREE - data.remaining);
        setLimitReached(data.remaining <= 0);
      }

      if (screenshotUrl) {
        setImage(screenshotUrl);
      }

      checkUsageCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, [image, note, limitReached, checkUsageCount, manualOcrText]);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      clearSession();
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
    const text = ticketToPlainText(ticket);

    try {
      await copyTicketAndImage(text, image);
      showToast(image ? "Copied image and ticket!" : "Copied ticket!");
    } catch {
      await navigator.clipboard.writeText(text);
      showToast("Copied ticket!");
    }
  };

  const reset = () => {
    clearSession();
    setImage(null);
    setNote("");
    setTicket("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (hasAiKey === null) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (!hasAiKey) {
    return (
      <>
        <Header
          title="Generate Ticket"
          subtitle="Connect an AI provider to start generating tickets."
        />

        <div className="mx-auto flex h-[70vh] max-w-lg items-center justify-center px-4">
          <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">

            <h2 className="text-xl font-semibold text-[var(--text)]">
              Connect an AI Provider
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              You need an API key before you can generate tickets. Connect
              OpenAI, OpenRouter or Anthropic from Settings.
            </p>

            <Link
              href="/dashboard/settings?tab=ai"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Connect API Key
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex h-[95dvh] flex-col overflow-hidden">
        <Header title="Generate Ticket" subtitle="">
          <Link
            href="/dashboard/history"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-(--muted) hover:text-(--text) transition"
          >
            <History className="w-3.5 h-3.5" />
            History
          </Link>
        </Header>

        <div className="px-4 py-1.5 text-xs text-(--muted)">
          Monthly usage:{" "}
          <span className="text-(--text) font-medium">
            {usageCount}/{monthlyLimit}
          </span>
        </div>

        {/* Scrollable output area — fills remaining space between header and fixed input */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="mx-auto max-w-3xl py-4">
            <OutputPanel
              ticket={ticket}
              onCopy={copyToClipboard}
              onReset={reset}
              onSendToSlack={sendToSlack}
              slackLoading={slackLoading}
              slackSent={slackSent}
              slackConnected={plan === "pro" ? slackConnected : false}
              onSendToLinear={sendToLinear}
              linearLoading={linearLoading}
              linearSent={linearSent}
              linearConnected={plan === "pro" ? linearConnected : false}
              disabled={!ticket || loading}
            />
          </div>
        </div>

        {/* Composer — fixed to bottom, never scrolls away */}
        <div className="shrink-0 bottom-0  bg-(--bg)">
          <div className="mx-auto max-w-4xl px-4 pt-3">
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
              onRemoveImage={() => {
                clearSession();
                setImage(null);
              }}
              onNoteChange={setNote}
              onGenerate={() => generateTicket()}
              onFileChange={handleFileChange}
              limitReached={limitReached}
              ocrFailed={ocrFailed}
              manualOcrText={manualOcrText}
              onManualOcrChange={setManualOcrText}
            />
          </div>
        </div>
      </div>
      <Toast message={toast} show={!!toast} />
    </>
  );
}
