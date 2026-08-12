"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/Toast";
import { Footer } from "@/components/Footer";
import { OutputPanel } from "@/components/OutputPanel";
import { ScreenshotDropzone } from "@/components/dashboard/ScreenshotDropzone";
import { TicketTypeSelector } from "@/components/dashboard/TicketTypeSelector";
import { AdvancedOptions } from "@/components/dashboard/AdvancedOptions";
import {
  OutputPreferences,
  type OutputPreferencesValue,
} from "@/components/dashboard/OutputPreferences";
import { useWorkspace } from "@/components/dashboard/WorkspaceBridge";
import { ticketToPlainText } from "@/lib/tickets/format";
import {
  PRIORITIES,
  SESSION_KEY,
  TICKET_TYPES,
  TOAST_DISMISS_MS,
  type TicketType,
} from "@/lib/constants";

type Priority = (typeof PRIORITIES)[number];
type DetailLevel = OutputPreferencesValue["detailLevel"];

const TYPE_DEFAULT_PREFS: Record<
  TicketType,
  Pick<
    OutputPreferencesValue,
    | "includeReproSteps"
    | "detectSeverity"
    | "detectComponent"
    | "includeTechnicalContext"
  >
> = {
  bug: {
    includeReproSteps: true,
    detectSeverity: true,
    detectComponent: true,
    includeTechnicalContext: false,
  },
  feature: {
    includeReproSteps: false,
    detectSeverity: false,
    detectComponent: false,
    includeTechnicalContext: false,
  },
  ui: {
    includeReproSteps: true,
    detectSeverity: false,
    detectComponent: true,
    includeTechnicalContext: false,
  },
  feedback: {
    includeReproSteps: false,
    detectSeverity: false,
    detectComponent: false,
    includeTechnicalContext: false,
  },
  task: {
    includeReproSteps: false,
    detectSeverity: false,
    detectComponent: false,
    includeTechnicalContext: false,
  },
};

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

interface SessionData {
  userId?: string;
  image: string | null;
  ticket: string;
  note: string;
  ticketType?: TicketType | null;
}

function saveSession(
  image: string | null,
  ticket: string,
  note: string,
  ticketType: TicketType | undefined,
  userId: string | undefined,
) {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId, image, ticket, note, ticketType }),
    );
  } catch {}
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
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
  const { user } = useUser();
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
  const [hasAiKey, setHasAiKey] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ticketType, setTicketType] = useState<TicketType | undefined>(
    undefined,
  );
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("standard");
  const [includeReproSteps, setIncludeReproSteps] = useState(true);
  const [detectSeverity, setDetectSeverity] = useState(true);
  const [detectComponent, setDetectComponent] = useState(true);
  const [includeTechnicalContext, setIncludeTechnicalContext] = useState(false);
  const [preferredPriority, setPreferredPriority] = useState<
    Priority | undefined
  >(undefined);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setHasAiKey(data.hasAiKey);
      })
      .catch(() => setHasAiKey(false));
  }, []);

  useEffect(() => {
    const restore = () => {
      const session = loadSession();
      if (!session) return;
      if (!user) return;
      if (session.userId && session.userId !== user.id) {
        clearSession();
        return;
      }
      setImage(session.image);
      setNote(session.note ?? "");
      setTicket(session.ticket ?? "");
      const restoredType = session.ticketType;
      if (restoredType && TICKET_TYPES.includes(restoredType)) {
        setTicketType(restoredType);
      }
    };
    const timer = setTimeout(restore, 0);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (ticket || image || note) {
      saveSession(image, ticket, note, ticketType, user?.id);
    }
  }, [image, ticket, note, ticketType, user]);

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

  const { onLoadTicket } = useWorkspace();

  useEffect(() => {
    const off = onLoadTicket((payload) => {
      if (payload.generatedTicket) {
        setImage(payload.screenshotUrl ?? null);
        setNote(payload.inputText ?? "");
        setTicket(payload.generatedTicket);
        if (
          payload.ticketType &&
          TICKET_TYPES.includes(payload.ticketType as TicketType)
        ) {
          setTicketType(payload.ticketType as TicketType);
        }
        setError("");
      }
    });
    return off;
  }, [onLoadTicket]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), TOAST_DISMISS_MS);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("slack_connected") === "true";
    const err = params.get("error");
    if (connected || err) {
      window.history.replaceState({}, "", "/app/generate");
      const timer = setTimeout(() => {
        if (connected) {
          showToast("Slack connected!");
        } else if (err) {
          showToast(err);
          setError(err);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

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
    const useText = manualOcrText.trim() || null;

    if (!img && !useText) {
      setError("Upload a screenshot first or paste text manually");
      return;
    }

    setLoading(true);
    setStatus(img ? "Uploading…" : "Analyzing screenshot…");
    setError("");
    setOcrFailed(false);

    try {
      let screenshotUrl: string | null = null;
      let imageDataUri: string | null = null;

      if (img) {
        if (img.startsWith("data:") || img.startsWith("blob:")) {
          screenshotUrl = await uploadImage(img);
          if (!screenshotUrl) {
            imageDataUri = img;
          }
        } else {
          screenshotUrl = img;
        }
      }

      setStatus("Analyzing screenshot…");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(useText ? { ocrText: useText } : {}),
          note,
          screenshotUrl,
          ...(imageDataUri ? { imageDataUri } : {}),
          ticketType,
          detailLevel,
          includeReproSteps,
          detectSeverity,
          detectComponent,
          includeTechnicalContext,
          preferredPriority,
          language: "en",
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate ticket");
      }

      setStatus("Writing ticket…");
      const data = await response.json();
      setTicket(data.ticket);
      setStatus("");

      if (screenshotUrl) {
        setImage(screenshotUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }, [
    image,
    note,
    manualOcrText,
    ticketType,
    detailLevel,
    includeReproSteps,
    detectSeverity,
    detectComponent,
    includeTechnicalContext,
    preferredPriority,
  ]);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      clearSession();
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = e.target?.result as string;
        setImage(img);
        setTicket("");
        setOcrFailed(false);
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
    setOcrFailed(false);
    setManualOcrText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTicketTypeChange = (type: TicketType | undefined) => {
    setTicketType(type);
    if (type) {
      const defaults = TYPE_DEFAULT_PREFS[type];
      setIncludeReproSteps(defaults.includeReproSteps);
      setDetectSeverity(defaults.detectSeverity);
      setDetectComponent(defaults.detectComponent);
      setIncludeTechnicalContext(defaults.includeTechnicalContext);
    }
  };

  const handlePrefsChange = (value: OutputPreferencesValue) => {
    setDetailLevel(value.detailLevel);
    setIncludeReproSteps(value.includeReproSteps);
    setDetectSeverity(value.detectSeverity);
    setDetectComponent(value.detectComponent);
    setIncludeTechnicalContext(value.includeTechnicalContext);
  };

  const prefsValue: OutputPreferencesValue = {
    detailLevel,
    includeReproSteps,
    detectSeverity,
    detectComponent,
    includeTechnicalContext,
  };

  if (hasAiKey === null) return null;

  if (!hasAiKey) {
    return (
      <div className="mx-auto flex max-w-lg py-24">
        <div className="w-full rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Connect an AI provider to start generating tickets
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            You need an API key before you can generate tickets. Connect OpenAI,
            OpenRouter or Anthropic from Settings.
          </p>
          <Button
            asChild
            variant="default"
            className="mt-6 h-auto rounded-full bg-gradient-to-r from-green-600 via-green-500 to-green-600 px-6 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            <Link href="/app/settings?tab=ai">Connect API Key</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 py-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
        <div className="space-y-6 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-2">
          <ScreenshotDropzone
            image={image}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            onFileChange={handleFileChange}
            onRemove={() => {
              clearSession();
              setImage(null);
            }}
            fileInputRef={fileInputRef}
            disabled={loading}
          />

          <TicketTypeSelector
            value={ticketType}
            onChange={handleTicketTypeChange}
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Additional context
              </span>
              <span className="text-xs text-muted-foreground/60">
                ( optional )
              </span>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              rows={2}
              placeholder="Describe anything the screenshot doesn't show…"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 200) + "px";
              }}
              className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-[3px] focus:ring-ring/30 disabled:opacity-50"
            />
          </div>

          <OutputPreferences value={prefsValue} onChange={handlePrefsChange} />

          <AdvancedOptions
            priority={preferredPriority}
            onPriorityChange={setPreferredPriority}
            manualOcrText={manualOcrText}
            onManualOcrChange={setManualOcrText}
            disabled={loading}
          />

          <Button
            type="button"
            variant="default"
            onClick={() => generateTicket()}
            disabled={loading || (!image && !manualOcrText.trim())}
            className="relative h-12 w-full overflow-hidden rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--glow)] transition-all duration-300 after:absolute after:inset-0 after:-translate-x-[150%] after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:transition-transform after:duration-700 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-12px_var(--glow)] hover:after:translate-x-[150%] active:translate-y-0 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {status || "Generating…"}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Ticket
              </>
            )}
          </Button>

          {error && <p className="px-1 text-sm text-muted-foreground">{error}</p>}
        </div>

        <div className="lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
          <OutputPanel
            ticket={ticket}
            loading={loading}
            status={status}
            ocrFailed={ocrFailed}
            manualOcrText={manualOcrText}
            onManualOcrChange={setManualOcrText}
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
      </div>
      <Toast message={toast} show={!!toast} />
      <Footer />
    </>
  );
}
