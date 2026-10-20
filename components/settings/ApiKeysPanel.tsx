"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PROVIDER_LABELS, type AiProvider } from "@/lib/constants";
import { notifyKeysChanged } from "@/lib/keys-events";

interface KeyRow {
  provider: AiProvider;
  status: "valid" | "invalid";
  hint: string | null;
}

interface KeyResponse {
  provider?: AiProvider | null;
  hasKey?: boolean;
  keys?: KeyRow[];
  error?: string;
}

const providerHint: Record<AiProvider, string> = {
  openai: "sk-...",
  openrouter: "sk-or-v1-...",
  anthropic: "sk-ant-...",
  google: "AIza...",
};

function StatusBadge({ row }: { row?: KeyRow }) {
  if (!row) {
    return (
      <Badge
        variant="outline"
        className="border-border px-2 py-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
      >
        Missing
      </Badge>
    );
  }
  if (row.status === "invalid") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 bg-amber-500/10 px-2 py-0 font-mono text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300"
      >
        Invalid
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-primary/40 bg-primary/10 px-2 py-0 font-mono text-[10px] uppercase tracking-wider text-primary"
    >
      Connected
    </Badge>
  );
}

export function ApiKeysPanel({ onChanged }: { onChanged?: () => void }) {
  const [keys, setKeys] = useState<KeyRow[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState<AiProvider | null>(null);
  const loading = !loaded;
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingProvider, setRemovingProvider] = useState<AiProvider | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings/ai-key")
      .then((res) => res.json())
      .then((data: KeyResponse) => {
        if (cancelled) return;
        setKeys(data.keys ?? []);
        setLoaded(true);
        setError("");
      })
      .catch(() => {
        if (cancelled) return;
        setLoaded(true);
        setError("Failed to check API key status");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const applyKeys = (next: KeyRow[]) => {
    setKeys(next);
    onChanged?.();
    notifyKeysChanged();
  };

  const startEdit = (provider: AiProvider) => {
    setEditing(provider);
    setKeyValue("");
    setShowKey(false);
    setError("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setKeyValue("");
    setError("");
  };

  const saveKey = async () => {
    if (!keyValue.trim() || saving || !editing) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/ai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyValue.trim() }),
      });
      const data: KeyResponse = await res.json();
      if (res.ok) {
        applyKeys(data.keys ?? []);
        cancelEdit();
      } else {
        setError(data.error || "Failed to save API key");
      }
    } catch {
      setError("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const removeKey = async (provider: AiProvider) => {
    if (removingProvider) return;
    setRemovingProvider(provider);
    setError("");
    try {
      const res = await fetch(
        `/api/settings/ai-key?provider=${encodeURIComponent(provider)}`,
        { method: "DELETE" },
      );
      const data: KeyResponse = await res.json();
      if (res.ok) {
        applyKeys(data.keys ?? []);
      } else {
        setError(data.error || "Failed to remove API key");
      }
    } catch {
      setError("Failed to remove API key");
    } finally {
      setRemovingProvider(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {loading && !keys && (
          <div className="flex items-center gap-2 px-3.5 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Checking keys…
          </div>
        )}

        {keys &&
          (["openai", "openrouter", "anthropic", "google"] as const).map(
            (provider) => {
              const row = keys.find((k) => k.provider === provider);
              const isEditing = editing === provider;

              return (
                <div key={provider} className="px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {PROVIDER_LABELS[provider]}
                      </span>
                      <StatusBadge row={row} />
                      {row?.hint && (
                        <span className="truncate font-mono text-xs text-muted-foreground">
                          {row.hint}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => startEdit(provider)}
                        >
                          {row ? (
                            <Trash2 className="size-3.5" aria-hidden />
                          ) : (
                            <Plus className="size-3.5" aria-hidden />
                          )}
                          {row ? "Replace" : "Add key"}
                        </Button>
                        {row && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${PROVIDER_LABELS[provider]} key`}
                            onClick={() => removeKey(provider)}
                            disabled={removingProvider === provider}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            {removingProvider === provider ? (
                              <Loader2
                                className="size-4 animate-spin"
                                aria-hidden
                              />
                            ) : (
                              <Trash2 className="size-4" aria-hidden />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-2.5 space-y-2">
                      <div className="relative">
                        <Input
                          type={showKey ? "text" : "password"}
                          autoComplete="off"
                          value={keyValue}
                          onChange={(e) => setKeyValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveKey()}
                          placeholder={providerHint[provider]}
                          aria-label={`${PROVIDER_LABELS[provider]} API key`}
                          className="h-9 pr-10 font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={showKey ? "Hide key" : "Show key"}
                          onClick={() => setShowKey((s) => !s)}
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKey ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="h-8"
                          onClick={saveKey}
                          disabled={saving || !keyValue.trim()}
                        >
                          {saving && (
                            <Loader2
                              className="size-3.5 animate-spin"
                              aria-hidden
                            />
                          )}
                          {saving ? "Testing key…" : "Save key"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            },
          )}
      </div>

      {error && (
        <Alert role="alert" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        Keys are encrypted with AES-256-GCM and never exposed to the browser
        after saving. Paste one per provider you use.
      </p>
    </div>
  );
}
