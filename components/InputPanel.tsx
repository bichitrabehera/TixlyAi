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
  ocrFailed?: boolean;
  manualOcrText?: string;
  onManualOcrChange?: (value: string) => void;
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
  ocrFailed = false,
  manualOcrText = "",
  onManualOcrChange,
}: InputPanelProps) {
  const isDisabled = loading || !image || limitReached;

  return (
    <div className=" bg-[var(--background)]">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Image preview - shows above input like Claude */}
        {image && (
          <div className="mb-3 w-fit flex items-start gap-3 p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <img
              src={image}
              alt="Uploaded"
              className="w-16 h-16 object-cover rounded-md border border-[var(--border)]"
            />

            <button
              onClick={onRemoveImage}
              className="text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1"
              disabled={loading}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Main input container */}
        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm focus-within:border-[var(--primary)] focus-within:shadow-md transition-all">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />

          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Describe the issue or paste context..."
            disabled={loading || limitReached}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 200) + "px";
            }}
            className="w-full px-4 py-3 pr-24 bg-transparent outline-none text-[15px] resize-none text-[var(--text)] placeholder:text-[var(--muted)] min-h-[52px] max-h-[200px]"
            style={{ lineHeight: "1" }}
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-2 pb-2">
            {/* Left: Attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || limitReached}
              className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach image"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[var(--muted)]"
              >
                <path
                  d="M17.5 8.33334V14.1667C17.5 15.5 16.5 16.6667 15 16.6667H5C3.5 16.6667 2.5 15.5 2.5 14.1667V5.83334C2.5 4.5 3.5 3.33334 5 3.33334H10.8333"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.3333 2.5L17.5 6.66667L10 14.1667L6.66667 14.5833L7.08333 11.25L13.3333 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              onClick={onGenerate}
              disabled={isDisabled}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{status || "Processing..."}</span>
                </>
              ) : (
                <>
                  <span>{limitReached ? "Limit reached" : "Send"}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && !limitReached && (
          <p className="mt-2 text-xs text-red-500 px-1">{error}</p>
        )}

        {/* Hint text */}
        {!image && !error && (
          <p className="mt-2 text-xs text-[var(--muted)] px-1">
            Attach a screenshot or image to generate a ticket
          </p>
        )}
      </div>
    </div>
  );
}
