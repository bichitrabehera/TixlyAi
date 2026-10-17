"use client";

import type { ChangeEvent, DragEvent, RefObject } from "react";
import { Cpu, Sparkles, Square, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScreenshotDropzone } from "@/components/dashboard/ScreenshotDropzone";
import { TicketTypeSelector } from "@/components/dashboard/TicketTypeSelector";
import {
  DetailLevelControl,
  type OutputPreferencesValue,
} from "@/components/dashboard/OutputPreferences";
import { AdvancedOptions } from "@/components/dashboard/AdvancedOptions";
import {
  PROVIDER_MODEL_LABEL,
  type AiProvider,
  type TicketType,
} from "@/lib/constants";
import type { Priority } from "@/lib/hooks/useTicketGeneration";
import { cn } from "@/lib/utils";

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
  fileInputRef: RefObject<HTMLInputElement | null>;
  onNoteChange: (value: string) => void;
  onTicketTypeChange: (value: TicketType | undefined) => void;
  onPreferredPriorityChange: (value: Priority | undefined) => void;
  onPrefsChange: (value: OutputPreferencesValue) => void;
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
  fileInputRef,
  onNoteChange,
  onTicketTypeChange,
  onPreferredPriorityChange,
  onPrefsChange,
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
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
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
              className="mt-2 min-h-0 resize-none rounded-lg bg-background text-xs"
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
            <span className="text-xs font-medium text-foreground">
              Additional Context
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70">
              markdown
            </span>
          </div>
          <Textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            disabled={loading}
            rows={4}
            placeholder="Anything the screenshot doesn't show — repro hints, environment, expected behavior…"
            className="min-h-[88px] w-full resize-none rounded-lg bg-background text-xs"
          />
        </section>

        <AdvancedOptions
          value={prefsValue}
          onChange={onPrefsChange}
          priority={preferredPriority}
          onPriorityChange={onPreferredPriorityChange}
          disabled={loading}
        />
      </div>

      <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-background px-3 py-3">
        {loading ? (
          <Button
            type="button"
            variant="outline"
            onClick={onStop}
            className="h-8 gap-1.5 rounded-md px-3 text-xs font-medium"
          >
            <Square className="h-3 w-3 fill-current" aria-hidden />
            Stop
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="h-8 gap-1.5 rounded-md px-3.5 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Generate
            <kbd className="ml-0.5 rounded border border-primary-foreground/25 bg-primary-foreground/15 px-1 py-px font-mono text-[10px] font-normal">
              ⌘↵
            </kbd>
          </Button>
        )}
      </footer>
    </div>
  );
}
