import { CircleCheck } from "lucide-react";

export function Toast({ message, show }: { message: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg">
      <CircleCheck className="h-4 w-4 text-emerald-400" />
      <span>{message}</span>
    </div>
  );
}