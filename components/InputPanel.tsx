import React from "react";

interface InputPanelProps {
  image: string | null;
  note: string;
  loading: boolean;
  status: string;
  error: string;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onClickDropzone: () => void;
  onRemoveImage: () => void;
  onNoteChange: (value: string) => void;
  onGenerate: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  limitReached?: boolean;
  onGenerateSuccess?: () => void;
}

export function InputPanel({
  image,
  note,
  loading,
  status,
  error,
  fileInputRef,
  onDrop,
  onDragOver,
  onClickDropzone,
  onRemoveImage,
  onNoteChange,
  onGenerate,
  onFileChange,
  limitReached = false,
}: InputPanelProps) {
  const isDisabled = loading || !image || limitReached;

  const buttonText = () => {
    if (loading) return status || "Processing...";
    if (limitReached) return "Limit reached";
    if (!image) return "Upload an image to generate";
    return "Generate Ticket ✨";
  };

  return (
    <section className="flex flex-col h-full rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[var(--border)]/50">
        <h2 className="text-lg font-semibold text-[var(--text)]">Input</h2>
        <p className="text-sm text-[var(--text)]/50 mt-1">
          Provide details or upload screenshot
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Screenshot Upload */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)]/80 mb-2">
            Screenshot
          </label>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onClick={onClickDropzone}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 ${
              image
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--bg)]"
            }`}
          >
            {image ? (
              <div className="relative p-4">
                <div className="relative rounded-lg overflow-hidden bg-[var(--bg)]">
                  <img
                    src={image}
                    alt="Screenshot preview"
                    className="w-full h-auto max-h-40 object-contain"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage();
                  }}
                  className="absolute top-2 right-2 rounded-full bg-[var(--text)]/80 text-white p-1.5 hover:bg-red-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="mb-3 p-3 rounded-xl bg-[var(--primary)]/10">
                  <svg
                    className="w-8 h-8 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-[var(--text)] font-medium text-center">
                  Drag & drop screenshot or click to upload
                </p>
                <p className="text-xs text-[var(--text)]/40 mt-1">
                  PNG, JPG, WebP supported
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* Context Textarea */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)]/80 mb-2">
            Describe the issue
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="What happened? Where did you see it? Any additional context..."
            disabled={loading || limitReached}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-sm placeholder:text-[var(--text)]/30 focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 focus:outline-none disabled:opacity-50 text-[var(--text)] resize-none transition-all"
            rows={4}
          />
        </div>

        {/* Error Message */}
        {error && !limitReached && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Limit Reached */}
        {limitReached && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-center">
            <p className="text-sm font-medium text-amber-400">
              You&apos;ve reached the free limit
            </p>
            <p className="text-xs text-[var(--text)]/50 mt-1">
              Upgrade to Pro for unlimited tickets
            </p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="p-6 pt-0">
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className={`w-full relative overflow-hidden rounded-xl px-5 py-4 font-semibold text-white transition-all duration-300 ${
            isDisabled
              ? "bg-[var(--text)]/20 cursor-not-allowed"
              : "bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/30 hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {status || "Processing..."}
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {buttonText()}
              </>
            )}
          </span>
        </button>
      </div>
    </section>
  );
}
