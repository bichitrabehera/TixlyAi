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
}: InputPanelProps) {
  return (
    <section className="border border-slate-300 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Paste screenshot</h2>
        <p className="text-sm text-slate-600">Drop an image or press Ctrl+V</p>
      </div>

      {/* DROPZONE */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={onClickDropzone}
        className="relative mb-6 min-h-64 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 transition"
      >
        {image ? (
          <div className="absolute inset-0 p-4">
            <img
              src={image}
              alt="Screenshot preview"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-slate-700">Paste or drop image</p>
            <p className="text-sm text-slate-500 mt-1">JPG, PNG, or GIF</p>
          </div>
        )}

        {image && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage();
            }}
            className="absolute top-3 right-3 rounded px-2 py-1 text-xs font-medium text-slate-600 shadow-sm"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* CONTEXT */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Add context (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="What's wrong? Where did you see it?"
          className="w-full rounded-lg border border-slate-200 p-3 text-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          rows={3}
        />
      </div>

      {/* GENERATE BUTTON */}
      <button
        onClick={onGenerate}
        disabled={loading || !image}
        className="w-full rounded-lg bg-teal-700 px-4 py-3 font-medium text-white transition hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? status || "Generating..." : "Generate ticket"}
      </button>

      {/* ERROR */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </section>
  );
}
