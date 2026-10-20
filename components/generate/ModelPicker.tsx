"use client";

import { MODEL_CATALOG, type CatalogModel } from "@/lib/ai/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROVIDER_LABELS, type AiProvider } from "@/lib/constants";

interface ModelPickerProps {
  provider: AiProvider | null;
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

function modelTag(model: CatalogModel): string | null {
  if (model.quality) return "Quality";
  if (model.fast) return "Fast";
  return null;
}

export function ModelPicker({
  provider,
  value,
  onChange,
  disabled = false,
}: ModelPickerProps) {
  if (!provider) {
    return (
      <section className="space-y-2">
        <span className="text-xs font-medium text-ink">Model</span>
        <p className="text-[11px] text-muted">
          Add an API key in{" "}
          <a
            href="/dashboard/settings?section=ai"
            className="text-primary underline-offset-2 hover:underline"
          >
            Settings
          </a>{" "}
          to choose a model.
        </p>
      </section>
    );
  }

  const models = MODEL_CATALOG[provider];

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink">Model</span>
        <span className="text-[11px] text-muted">
          {PROVIDER_LABELS[provider]}
        </span>
      </div>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          size="sm"
          className="w-full bg-control font-mono text-xs shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        >
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent align="start">
          {models.map((model) => {
            const tag = modelTag(model);
            return (
              <SelectItem
                key={model.id}
                value={model.id}
                className="font-mono text-xs"
              >
                <span className="flex items-center gap-2">
                  <span>{model.label}</span>
                  {tag && (
                    <span className="rounded border border-control-border bg-panel px-1.5 py-0 font-mono text-[10px] uppercase tracking-wider text-muted">
                      {tag}
                    </span>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </section>
  );
}
