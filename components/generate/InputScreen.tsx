"use client";

import type { ChangeEvent, DragEvent, RefObject } from "react";
import { Square } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScreenshotDropzone } from "@/components/dashboard/ScreenshotDropzone";
import { TicketTypeSelector } from "@/components/dashboard/TicketTypeSelector";
import {
  DetailLevelControl,
  type OutputPreferencesValue,
} from "@/components/dashboard/OutputPreferences";
import { AdvancedOptions } from "@/components/dashboard/AdvancedOptions";
import { ModelPicker } from "@/components/generate/ModelPicker";
import type { AiProvider, TicketType } from "@/lib/constants";
import type { Priority } from "@/lib/hooks/useTicketGeneration";

interface InputScreenProps {
  image: string | null;
  fileName: string | null;
  note: string;
  loading: boolean;
  ocrFailed: boolean;
  manualOcrText: string;
  fileError: string | null;
  dragging: boolean;
  ticketType: TicketType | undefined;
  preferredPriority: Priority | undefined;
  prefsValue: OutputPreferencesValue;
  aiProvider: AiProvider | null;
  model: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onNoteChange: (value: string) => void;
  onTicketTypeChange: (value: TicketType | undefined) => void;
  onPreferredPriorityChange: (value: Priority | undefined) => void;
  onPrefsChange: (value: OutputPreferencesValue) => void;
  onModelChange: (value: string) => void;
  onManualOcrChange: (value: string) => void;
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onGenerate: () => void;
  onStop: () => void;
}

export function InputScreen({
  image,
  fileName,
  note,
  loading,
  ocrFailed,
  manualOcrText,
  fileError,
  dragging,
  ticketType,
  preferredPriority,
  prefsValue,
  aiProvider,
  model,
  fileInputRef,
  onNoteChange,
  onTicketTypeChange,
  onPreferredPriorityChange,
  onPrefsChange,
  onModelChange,
  onManualOcrChange,
  onDrop,
  onDragOver,
  onFileChange,
  onRemoveImage,
  onGenerate,
  onStop,
}: InputScreenProps) {
  const canGenerate = !loading && !!image;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <ScreenshotDropzone
          image={image}
          fileName={fileName}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={() => fileInputRef.current?.click()}
          onFileChange={onFileChange}
          onRemove={onRemoveImage}
          fileInputRef={fileInputRef}
          disabled={loading}
          dragging={dragging}
          fileError={fileError}
        />

        {ocrFailed && (
          <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-xs font-medium text-foreground">
              We couldn&apos;t read text from your screenshot
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Paste the on-screen text and generate again.
            </p>
            <Textarea
              value={manualOcrText}
              onChange={(event) => onManualOcrChange(event.target.value)}
              rows={4}
              placeholder="Paste the text from the screenshot here…"
              className="mt-2 min-h-0 resize-none rounded-lg bg-canvas text-xs"
            />
          </section>
        )}

        <TicketTypeSelector
          value={ticketType}
          onChange={onTicketTypeChange}
          disabled={loading}
        />

        <DetailLevelControl
          value={prefsValue.detailLevel}
          onChange={(detailLevel) =>
            onPrefsChange({ ...prefsValue, detailLevel })
          }
          disabled={loading}
        />

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-ink">
              Additional Context
            </span>
          </div>
          <Textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Anything the screenshot doesn't show — repro hints, environment, expected behavior…"
            className="w-full resize-none rounded-lg border border-control-border bg-canvas p-3 text-xs text-ink placeholder:text-ink-3 transition-colors focus:border-ink focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </section>

        <ModelPicker
          provider={aiProvider}
          value={model}
          onChange={onModelChange}
          disabled={loading}
        />

        <AdvancedOptions
          value={prefsValue}
          onChange={onPrefsChange}
          priority={preferredPriority}
          onPriorityChange={onPreferredPriorityChange}
          disabled={loading}
        />
      </div>

      <footer className="flex shrink-0 items-center justify-between  bg-canvas p-4">
        <p className="flex items-baseline gap-1.5 text-xs">
          <span className="font-bold text-ink">{image ? 1 : 0}</span>
          <span className="text-muted">
            {image ? "capture ready" : "awaiting capture"}
          </span>
        </p>

        {loading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-control-border bg-control px-4 py-2 text-xs font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Square className="h-3 w-3 fill-current" aria-hidden />
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Generate Ticket
          </button>
        )}
      </footer>
    </div>
  );
}
