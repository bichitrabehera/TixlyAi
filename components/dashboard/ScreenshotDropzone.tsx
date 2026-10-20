// ```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, ImageIcon, RefreshCw, X } from "lucide-react";
import { FieldLabel } from "@/components/shared/FieldLabel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <section className="space-y-4" aria-labelledby="screenshot-label">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel
          id="screenshot-label"
          required
          className="text-sm font-medium text-ink"
        >
          Source screenshot
        </FieldLabel>

        {image && dimensions && (
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
        <>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-control-border bg-panel p-3 transition-colors",
              dragging && "border-primary bg-primary/5",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                Screenshot added
              </p>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {fileName || "Image ready to process"}
                {dimensions && ` · ${dimensions.w} × ${dimensions.h}`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                disabled={disabled}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Preview screenshot"
              >
                <Eye className="size-3.5" aria-hidden />
                Preview
              </button>

              <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Replace screenshot"
                title="Replace screenshot"
              >
                <RefreshCw className="size-3.5" aria-hidden />
              </button>

              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Remove screenshot"
                title="Remove screenshot"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-4xl rounded-lg gap-4 p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-base">
                  Screenshot preview
                </DialogTitle>

                <DialogDescription className="truncate text-xs">
                  {fileName || "Uploaded screenshot"}
                  {dimensions && ` · ${dimensions.w} × ${dimensions.h}`}
                </DialogDescription>
              </DialogHeader>

              <div className="relative flex max-h-[75vh] min-h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/50">
                <Image
                  src={image}
                  alt="Full preview of uploaded screenshot"
                  width={dimensions?.w || 1600}
                  height={dimensions?.h || 900}
                  unoptimized
                  onLoad={(event) => {
                    const img = event.currentTarget;

                    if (img.naturalWidth && img.naturalHeight) {
                      setDimensions({
                        w: img.naturalWidth,
                        h: img.naturalHeight,
                      });
                    }
                  }}
                  className="max-h-[75vh] w-auto max-w-full rounded-md object-contain"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-ink transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewOpen(false);
                    onClick();
                  }}
                  disabled={disabled}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className="size-3.5" aria-hidden />
                  Replace
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div
          id="screenshot-help"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-labelledby="screenshot-label screenshot-help"
          onClick={onClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();

              if (!disabled) {
                onClick();
              }
            }
          }}
          className={cn(
            "group flex min-h-[132px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-dash bg-canvas px-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            dragging && "border-primary bg-primary/5",
            !dragging && "hover:border-ink-3",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:text-ink">
            <ImageIcon className="size-4" aria-hidden />
          </span>

          <div>
            <p className="text-sm font-medium text-ink">
              {dragging ? "Drop your screenshot" : "Add a screenshot"}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Drag and drop or click to browse
            </p>

            <p className="mt-1 text-[11px] text-ink-3">
              PNG · JPG · WEBP · HEIC · Max 10 MB
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
// ```
