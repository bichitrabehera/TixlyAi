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
      className={cn(" text-xs", className)}
    >
      {connected ? connectedLabel : disconnectedLabel}
    </Badge>
  );
}
