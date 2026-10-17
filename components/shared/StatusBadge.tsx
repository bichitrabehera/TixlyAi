import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  connected,
  connectedLabel = "Connected",
  disconnectedLabel = "Disconnected",
  className,
}: {
  connected: boolean;
  connectedLabel?: string;
  disconnectedLabel?: string;
  className?: string;
}) {
  return (
    <Badge
      variant={connected ? "success" : "secondary"}
      className={cn(
        "font-mono text-xs uppercase tracking-widest",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          connected ? "bg-current" : "bg-current opacity-40",
        )}
      />
      {connected ? connectedLabel : disconnectedLabel}
    </Badge>
  );
}