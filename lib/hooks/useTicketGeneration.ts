"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useWorkspace } from "@/components/dashboard/WorkspaceBridge";
import type { OutputPreferencesValue } from "@/components/dashboard/OutputPreferences";
import { ticketToPlainText } from "@/lib/tickets/format";
import {
  ALLOWED_IMAGE_EXT,
  ALLOWED_IMAGE_MIME,
  DETAIL_LEVELS,
  MAX_IMAGE_BYTES,
  MODEL_STORAGE_KEY,
  PREFS_STORAGE_KEY,
  PRIORITIES,
  TICKET_TYPES,
  type AiProvider,
  type TicketType,
} from "@/lib/constants";
import { MODEL_CATALOG, defaultModelFor } from "@/lib/ai/config";
import type { RunStreamEvent, StreamStep } from "@/lib/ai/stream-types";
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/hooks/useSessionPersistence";
import { KEYS_CHANGED_EVENT } from "@/lib/keys-events";

export type Priority = (typeof PRIORITIES)[number];
export type DetailLevel = OutputPreferencesValue["detailLevel"];

export interface RunUsage {
  inputTokens?: number;
  outputTokens?: number;
  model?: string;
  latencyMs?: number;
}

export type RunnerEvent = RunStreamEvent & {
  ticketId?: string;
  saveFailed?: boolean;
};

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

function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function isValidImageFile(file: File): {
  ok: boolean;
  error?: string;
} {
  const name = file.name.toLowerCase();
  const extOk = ALLOWED_IMAGE_EXT.some((ext) => name.endsWith(ext));
  const typeOk =
    !file.type ||
    (ALLOWED_IMAGE_MIME as readonly string[]).includes(file.type);

  if (!typeOk && !extOk) {
    return {
      ok: false,
      error: "Unsupported format. Use a PNG, JPG, WEBP or HEIC screenshot.",
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      error: "This file is larger than 10 MB. Upload a smaller screenshot.",
    };
  }
  return { ok: true };
}

function loadStoredPrefs(): Partial<OutputPreferencesValue> | null {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OutputPreferencesValue>;
    if (
      parsed &&
      (!parsed.detailLevel ||
        (DETAIL_LEVELS as readonly string[]).includes(parsed.detailLevel))
    ) {
      return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return null;
}

export function useTicketGeneration() {
  const { user } = useUser();
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [ticket, setTicket] = useState("");
  const [ticketDirty, setTicketDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [steps, setSteps] = useState<StreamStep[]>([]);
  const [guardrailNotice, setGuardrailNotice] = useState<string | null>(null);
  const [usage, setUsage] = useState<RunUsage | null>(null);
  const [needsReview, setNeedsReview] = useState(false);
  const [error, setError] = useState("");
  const [ocrFailed, setOcrFailed] = useState(false);
  const [manualOcrText, setManualOcrText] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hasAiKey, setHasAiKey] = useState<boolean | null>(null);
  const [aiProvider, setAiProvider] = useState<AiProvider | null>(null);
  const [model, setModel] = useState<string>("");
  const [uploadCount, setUploadCount] = useState(0);
  const [screen, setScreen] = useState<"input" | "output">("input");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  const refreshKeyStatus = useCallback(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setHasAiKey(data.hasAiKey);
        const provider = (data.aiProvider as AiProvider | null) ?? null;
        setAiProvider(provider);
        // Resolve the model alongside the provider: prefer the stored pick if
        // it's still in the provider's catalog, else the catalog default.
        if (provider) {
          let stored: string | null = null;
          try {
            stored = localStorage.getItem(MODEL_STORAGE_KEY);
          } catch {
            /* ignore private mode */
          }
          const catalogIds = MODEL_CATALOG[provider].map((m) => m.id);
          setModel(
            stored && catalogIds.includes(stored)
              ? stored
              : defaultModelFor(provider),
          );
        }
      })
      .catch(() => setHasAiKey(false));
  }, []);

  useEffect(() => {
    refreshKeyStatus();
  }, [refreshKeyStatus]);

  // Persist the model pick.
  useEffect(() => {
    try {
      if (model) localStorage.setItem(MODEL_STORAGE_KEY, model);
    } catch {
      /* ignore quota/private mode */
    }
  }, [model]);

  // The Settings dialog (rendered in the app shell) is the only place keys
  // change now; it broadcasts so this workspace can re-check the key gate.
  useEffect(() => {
    const handler = () => refreshKeyStatus();
    window.addEventListener(KEYS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(KEYS_CHANGED_EVENT, handler);
  }, [refreshKeyStatus]);

  // localStorage is unavailable during SSR, so stored prefs are applied after
  // mount to avoid a hydration mismatch between server and client HTML.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = loadStoredPrefs();
    if (!stored) return;
    if (stored.detailLevel) setDetailLevel(stored.detailLevel);
    if (typeof stored.includeReproSteps === "boolean")
      setIncludeReproSteps(stored.includeReproSteps);
    if (typeof stored.detectSeverity === "boolean")
      setDetectSeverity(stored.detectSeverity);
    if (typeof stored.detectComponent === "boolean")
      setDetectComponent(stored.detectComponent);
    if (typeof stored.includeTechnicalContext === "boolean")
      setIncludeTechnicalContext(stored.includeTechnicalContext);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const prefsValue: OutputPreferencesValue = useMemo(
    () => ({
      detailLevel,
      includeReproSteps,
      detectSeverity,
      detectComponent,
      includeTechnicalContext,
    }),
    [
      detailLevel,
      includeReproSteps,
      detectSeverity,
      detectComponent,
      includeTechnicalContext,
    ],
  );

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefsValue));
    } catch {
      /* ignore quota/private mode */
    }
  }, [prefsValue]);

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
      if (session.ticket) setScreen("output");
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

  const { onLoadTicket } = useWorkspace();

  useEffect(() => {
    const off = onLoadTicket((payload) => {
      if (payload.generatedTicket) {
        setImage(payload.screenshotUrl ?? null);
        setNote(payload.inputText ?? "");
        setTicket(payload.generatedTicket);
        setTicketDirty(false);
        setScreen("output");
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

  // Window-level guard so dropping a file anywhere else doesn't navigate away.
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onEnter = (e: DragEvent) => {
      if (hasFiles(e)) {
        depth += 1;
        setDragging(true);
      }
    };
    const onLeave = (e: DragEvent) => {
      if (hasFiles(e)) {
        depth = Math.max(0, depth - 1);
        if (depth === 0) setDragging(false);
      }
    };
    const onDrop = (e: DragEvent) => {
      if (hasFiles(e)) {
        e.preventDefault();
        depth = 0;
        setDragging(false);
      }
    };
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const uploadImage = useCallback(
    async (base64Data: string): Promise<string | null> => {
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
    },
    [],
  );

  const generateTicket = useCallback(async () => {
    if (!image) {
      setError("Add a screenshot to continue");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setStatus("Analyzing screenshot…");
    setError("");
    setOcrFailed(false);
    setSteps([]);
    setGuardrailNotice(null);
    setUsage(null);
    setNeedsReview(false);

    try {
      const ocrText = manualOcrText.trim();

      let screenshotUrl: string | null = null;
      let imageDataUri: string | null = null;

      if (image.startsWith("data:") || image.startsWith("blob:")) {
        setStatus("Uploading…");
        screenshotUrl = await uploadImage(image);
        if (!screenshotUrl) {
          imageDataUri = image;
        }
      } else {
        screenshotUrl = image;
      }

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(ocrText ? { ocrText } : {}),
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
          ...(model ? { model } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to generate ticket");
      }

      if (!response.body) {
        throw new Error("Streaming is not supported in this browser");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedTicket: string | null = null;

      const handleEvent = (event: RunnerEvent) => {
        switch (event.type) {
          case "step":
            setSteps((prev) => {
              const next = [...prev];
              const index = next.findIndex((s) => s.id === event.step.id);
              if (index >= 0) next[index] = event.step;
              else next.push(event.step);
              return next;
            });
            if (event.step.status === "running") setStatus(event.step.label + "…");
            break;
          case "guardrail":
            setGuardrailNotice(event.message);
            break;
          case "done":
            streamedTicket = event.ticket;
            setTicket(event.ticket);
            setTicketDirty(false);
            setSteps(event.steps);
            setUsage(event.usage ?? null);
            setNeedsReview(event.needsReview);
            setStatus("");
            setScreen("output");
            if (event.saveFailed) {
              toast.warning(
                "Ticket generated but couldn't be saved to history. It will not appear under History.",
              );
            }
            break;
          case "error":
            throw new Error(event.message);
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          let newlineIndex = buffer.indexOf("\n");
          while (newlineIndex >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (line) handleEvent(JSON.parse(line) as RunnerEvent);
            newlineIndex = buffer.indexOf("\n");
          }
        }

        const tail = buffer.trim();
        if (tail) handleEvent(JSON.parse(tail) as RunnerEvent);
      } finally {
        reader.releaseLock();
      }

      if (!streamedTicket) {
        throw new Error("The agent stopped before producing a ticket");
      }

      if (screenshotUrl) {
        setImage(screenshotUrl);
      }
    } catch (err) {
      const aborted =
        controller.signal.aborted ||
        (err instanceof DOMException && err.name === "AbortError");
      if (aborted) {
        setStatus("");
        toast("Generation stopped");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStatus("");
      }
    } finally {
      abortRef.current = null;
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
    model,
    uploadImage,
  ]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    const valid = isValidImageFile(file);
    if (!valid.ok) {
      setFileError(valid.error ?? "Unsupported file.");
      return;
    }
    setFileError(null);

    try {
      const name = file.name.toLowerCase();
      const isHeic =
        /image\/hei[cf]/.test(file.type) || /\.(heic|heif)$/.test(name);
      let dataUrl: string;

      if (isHeic) {
        const heic2any = (await import("heic2any")).default;
        const converted = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
        const blob = Array.isArray(converted) ? converted[0] : converted;
        dataUrl = await readAsDataURL(blob);
      } else {
        dataUrl = await readAsDataURL(file);
      }

      clearSession();
      setImage(dataUrl);
      setFileName(file.name);
      setTicket("");
      setTicketDirty(false);
      setOcrFailed(false);
      setError("");
      setStatus("");
      setSteps([]);
      setGuardrailNotice(null);
      setUsage(null);
      setNeedsReview(false);
      setUploadCount((count) => count + 1);
    } catch {
      setFileError(
        "We couldn't read this image. Try a PNG, JPG or WEBP screenshot instead.",
      );
    }
  }, []);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) void handleFile(file);
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
      e.stopPropagation();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const removeImage = useCallback(() => {
    clearSession();
    setImage(null);
    setFileName(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const copyToClipboard = async () => {
    if (!ticket) return;
    const text = ticketToPlainText(ticket);

    try {
      await copyTicketAndImage(text, image);
      toast.success(image ? "Copied image and ticket!" : "Copied ticket!");
    } catch {
      await navigator.clipboard.writeText(text);
      toast.success("Copied ticket!");
    }
  };

  const exportTicket = useCallback(() => {
    if (!ticket) return;
    const text = ticketToPlainText(ticket);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ticket.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [ticket]);

  const markTicketEdited = useCallback((value: string) => {
    setTicket(value);
    setTicketDirty(true);
  }, []);

  const reset = () => {
    clearSession();
    setImage(null);
    setFileName(null);
    setNote("");
    setTicket("");
    setTicketDirty(false);
    setError("");
    setOcrFailed(false);
    setManualOcrText("");
    setFileError(null);
    setSteps([]);
    setGuardrailNotice(null);
    setUsage(null);
    setNeedsReview(false);
    setStatus("");
    setScreen("input");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showInput = useCallback(() => setScreen("input"), []);

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

  const generateRef = useRef(generateTicket);
  useEffect(() => {
    generateRef.current = generateTicket;
  }, [generateTicket]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        if (!abortRef.current) void generateRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return {
    image,
    fileName,
    note,
    ticket,
    ticketDirty,
    loading,
    status,
    steps,
    guardrailNotice,
    usage,
    needsReview,
    error,
    ocrFailed,
    manualOcrText,
    fileError,
    dragging,
    hasAiKey,
    aiProvider,
    model,
    ticketType,
    preferredPriority,
    prefsValue,
    uploadCount,
    screen,
    fileInputRef,
    setImage,
    setNote,
    setTicket,
    setError,
    setManualOcrText,
    setOcrFailed,
    setPreferredPriority,
    setModel,
    setScreen,
    generateTicket,
    stopGeneration,
    handleFile,
    handleDrop,
    handleDragOver,
    handleFileChange,
    removeImage,
    copyToClipboard,
    exportTicket,
    markTicketEdited,
    reset,
    showInput,
    handleTicketTypeChange,
    handlePrefsChange,
    refreshKeyStatus,
  };
}
