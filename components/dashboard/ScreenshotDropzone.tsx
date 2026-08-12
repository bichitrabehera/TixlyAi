"use client";

import Image from "next/image";
import { ImagePlus } from "lucide-react";

interface ScreenshotDropzoneProps {
  image: string | null;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export function ScreenshotDropzone({
  image,
  onDrop,
  onDragOver,
  onClick,
  onFileChange,
  onRemove,
  fileInputRef,
  disabled = false,
}: ScreenshotDropzoneProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Screenshot
        </span>
        <span className="text-xs text-muted-foreground/60">( Required )</span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onFileChange}
        className="hidden"
      />

      {image ? (
        <div className="relative h-42 overflow-hidden rounded-2xl border border-border bg-card">
          <Image
            src={image}
            alt="Screenshot preview"
            fill
            unoptimized
            className="object-contain"
          />
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClick}
              disabled={disabled}
              className="rounded-lg bg-background/80 px-2.5 py-1.5 text-xs text-foreground backdrop-blur transition-colors hover:bg-foreground/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Replace screenshot
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              title="Remove screenshot"
              className="rounded-lg bg-background/80 px-2.5 py-1.5 text-xs text-foreground backdrop-blur transition-colors hover:bg-foreground/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          disabled={disabled}
          className="group flex w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-input bg-card px-6 py-12 text-center transition-colors hover:border-primary/60 hover:bg-primary/[0.03] disabled:pointer-events-none disabled:opacity-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors group-hover:border-primary/50 group-hover:text-primary">
            <ImagePlus className="h-5 w-5 transition-colors" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Upload screenshot
          </p>
          <p className="text-xs text-muted-foreground">
            Drag &amp; drop, click to browse, or paste anywhere
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            PNG · JPG · WEBP
          </p>
        </button>
      )}
    </div>
  );
}
