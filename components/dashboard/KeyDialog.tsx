"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, Loader2, Trash2 } from "lucide-react";
import type { AiKeyStatus } from "./TopBar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const providerLabels: Record<string, string> = {
  openai: "OpenAI",
  openrouter: "OpenRouter",
  anthropic: "Anthropic",
};

export function KeyDialog({
  open,
  onOpenChange,
  status,
  onStatusChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status?: AiKeyStatus | null;
  onStatusChange?: (status: AiKeyStatus) => void;
}) {
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState<AiKeyStatus | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/settings/ai-key")
      .then((res) => res.json())
      .then((data: AiKeyStatus) => {
        if (cancelled) return;
        setConnected({
          hasKey: !!data.hasKey,
          provider: data.provider || null,
        });
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Failed to check API key status");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const hasKey = connected?.hasKey ?? status?.hasKey ?? false;
  const provider = connected?.provider ?? status?.provider ?? null;

  const saveKey = async () => {
    if (!keyValue.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/ai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyValue.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        const next: AiKeyStatus = {
          hasKey: true,
          provider: data.provider || null,
        };
        setConnected(next);
        onStatusChange?.(next);
        setKeyValue("");
      } else {
        setError(data.error || "Failed to save API key");
      }
    } catch {
      setError("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const removeKey = async () => {
    if (removing) return;
    setRemoving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/ai-key", { method: "DELETE" });
      if (res.ok) {
        const next: AiKeyStatus = { hasKey: false, provider: null };
        setConnected(next);
        onStatusChange?.(next);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove API key");
      }
    } catch {
      setError("Failed to remove API key");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[var(--muted)]" />
            AI API key
          </DialogTitle>
          <DialogDescription>
            Connect OpenAI, OpenRouter or Anthropic to generate tickets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {hasKey ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">
                      {provider
                        ? (providerLabels[provider] ?? provider)
                        : "Connected"}
                    </p>
                    <p className="text-xs text-green-600">Key active</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-[12px] font-medium text-green-600">
                  Connected
                </span>
              </div>
              <button
                type="button"
                onClick={removeKey}
                disabled={removing}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3.5 py-2 text-sm font-medium bg-red-500 transition hover:bg-red-500/70 disabled:opacity-50 hover:cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {removing ? "Removing..." : "Remove key"}
              </button>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs leading-5 text-[var(--muted)]">
                Connect OpenAI, OpenRouter or Anthropic to generate tickets.
              </p>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveKey()}
                  placeholder="sk-... / sk-or-v1-... / sk-ant-..."
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-transparent pl-3 pr-9 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  aria-label={showKey ? "Hide key" : "Show key"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="button"
                onClick={saveKey}
                disabled={saving || !keyValue.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "Testing key..." : "Save API key"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
