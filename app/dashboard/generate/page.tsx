"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Tesseract from "tesseract.js";
import { Toast } from "@/components/Toast";
import { InputPanel } from "@/components/InputPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { History } from "lucide-react";
import Link from "next/link";
import Header from "@/components/dashboard/Header";
import { ticketToPlainText } from "@/lib/tickets/format";

const SESSION_KEY = "tixly_session";

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
  const [dailyLimit, setDailyLimit] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore session on mount (like ChatGPT)
  useEffect(() => {
    const session = loadSession();
    if (session) {
      setImage(session.image);
      setNote(session.note);
      setTicket(session.ticket);
    }
  }, []);

  // Save session whenever state changes
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
        setDailyLimit(data.usage.dailyLimit);
        setUsageCount(data.usage.todayUsage);
        setLimitReached(data.usage.todayUsage >= data.usage.dailyLimit);
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
    setTimeout(() => setToast(""), 2000);
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
        // For remote URLs, fetch the image first for OCR
        let ocrSource = img;
        if (img.startsWith("http")) {
          const blob = await fetch(img).then((r) => r.blob());
          ocrSource = URL.createObjectURL(blob);
        }

        try {
          const {
            data: { text: ocrText },
          } = await Tesseract.recognize(ocrSource, "eng", {
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

      if (screenshotUrl) {
        setImage(screenshotUrl);
      }

      await copyTicketAndImage(ticketToPlainText(data.ticket), screenshotUrl || img);
      showToast("Copied to clipboard!");

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
      // Clear session since user is starting fresh
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

  return (
    <>
      <Header
        title="Generate Ticket"
        subtitle="Convert screenshots into structured tickets"
      >
        <Link
          href="/dashboard/history"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-(--card) border border-(--border) text-(--text)/70 hover:bg-(--border)/60 transition-all"
        >
          <History className="w-4 h-4" />
          History
        </Link>
      </Header>

      <div className="mb-6">
        <div className="text-sm text-(--text)/50">
          Usage today: <span className="font-semibold text-(--text)">{usageCount}/{dailyLimit}</span>
        </div>
      </div>

      <div className="grid mx-auto gap-6 lg:grid-cols-2 max-w-8xl">
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

        <OutputPanel
          ticket={ticket}
          onCopy={copyToClipboard}
          onReset={reset}
          onSendToSlack={sendToSlack}
          slackLoading={slackLoading}
          slackSent={slackSent}
          slackConnected={slackConnected}
          onSendToLinear={sendToLinear}
          linearLoading={linearLoading}
          linearSent={linearSent}
          linearConnected={linearConnected}
          disabled={!ticket || loading}
        />
      </div>

      <Toast message={toast} show={!!toast} />
    </>
  );
}
