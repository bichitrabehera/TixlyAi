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
    return "Generate ticket";
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Screenshot</h2>
        <p className="text-sm text-neutral-500 mt-1">Paste or drop an image (Ctrl+V)</p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={onClickDropzone}
        className="relative mb-6 flex min-h-56 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition hover:border-neutral-400 hover:bg-neutral-100"
      >
        {image ? (
          <div className="flex flex-col items-center">
            <img
              src={image}
              alt="Screenshot preview"
              className="max-h-48 object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveImage();
              }}
              className="mt-3 rounded-lg bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-300"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-medium text-neutral-700">Drop image here</p>
            <p className="text-sm text-neutral-400 mt-1">or click to upload</p>
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

      <div className="mb-5">
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Context (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="What's wrong? Where did you see it?"
          disabled={loading || limitReached}
          className="w-full rounded-lg border border-neutral-200 p-3 text-sm placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none disabled:opacity-50"
          rows={2}
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isDisabled}
        className="w-full rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {buttonText()}
      </button>

      {/* Limit reached message */}
      {limitReached && (
        <div className="mt-4 rounded-lg bg-neutral-100 p-4 text-center">
          <p className="text-base font-medium text-neutral-700">🚀 You've reached the free MVP limit.</p>
          <p className="text-sm text-neutral-500 mt-2">
            This is an early version of SnapShot.
            <br />
            We're working on login, Slack, Jira integrations and more.
            <br />
            <span className="text-neutral-400">Stay tuned 👀</span>
          </p>
        </div>
      )}

      {error && !limitReached && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </section>
  );
}