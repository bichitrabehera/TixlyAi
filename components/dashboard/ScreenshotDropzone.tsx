"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import { FieldLabel } from "@/components/shared/FieldLabel";
import { cn } from "@/lib/utils";

interface ScreenshotDropzoneProps {
  image: string | null;
  fileName?: string | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
  dragging?: boolean;
  fileError?: string | null;
}

export function ScreenshotDropzone({
  image,
  fileName,
  onDrop,
  onDragOver,
  onClick,
  onFileChange,
  onRemove,
  fileInputRef,
  disabled = false,
  dragging = false,
  fileError = null,
}: ScreenshotDropzoneProps) {
  const [dimensions, setDimensions] = useState<{
    w: number;
    h: number;
  } | null>(null);

  return (
    <section className="space-y-2" aria-labelledby="screenshot-label">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel
          id="screenshot-label"
          required
          className="text-xs font-medium text-ink"
        >
          Source Screenshot
        </FieldLabel>
        {dimensions && (
          <span className="font-mono text-[11px] text-ink-3">
            {dimensions.w} × {dimensions.h}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
        onChange={onFileChange}
        className="hidden"
        aria-labelledby="screenshot-label"
        aria-describedby="screenshot-help"
      />

      {image ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={cn(
            "group relative rounded-xl border border-dashed border-dash bg-canvas p-2.5 transition-all hover:border-ink-3",
            dragging && "border-ink",
          )}
        >
          <div className="relative aspect-video max-h-[220px] min-h-[132px] overflow-hidden rounded-lg border border-hairline bg-[#141413]">
            <Image
              src={image}
              alt="Uploaded screenshot preview"
              fill
              unoptimized
              onLoad={(event) => {
                const img = event.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
                }
              }}
              className="object-contain"
            />
          </div>

          <div className="absolute right-4 top-4 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClick}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-md border border-control-border bg-canvas/95 px-2.5 py-1 text-[11px] font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-xs transition-colors hover:bg-control focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              Replace
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              aria-label="Remove screenshot"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-control-border bg-canvas/95 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-xs transition-colors hover:bg-control focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby="screenshot-label screenshot-help"
          onClick={onClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (!disabled) onClick();
            }
          }}
          className={cn(
            "group flex min-h-[132px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-dash bg-canvas px-4 text-center transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink",
            dragging && "border-ink",
            !dragging && "hover:border-ink-3",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-md border border-control-border bg-panel text-muted transition-colors group-hover:text-ink">
            <ImagePlus className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-medium text-ink">
              {dragging ? "Drop your screenshot" : "Drop or paste a screenshot"}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-3">
              PNG · JPG · WEBP · HEIC · 10 MB
            </p>
          </div>
        </div>
      )}

      {fileError && (
        <p role="alert" className="text-xs text-destructive">
          {fileError}
        </p>
      )}
    </section>
  );
}
