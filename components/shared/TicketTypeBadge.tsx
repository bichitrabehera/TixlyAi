import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { TICKET_TYPE_META } from "@/lib/constants";

export function TicketTypeBadge({
  ticketType,
  selected,
  className,
}: {
  ticketType: string | null;
  selected?: boolean;
  className?: string;
}) {
  if (!ticketType || !(ticketType in TICKET_TYPE_META)) return null;
  const meta = TICKET_TYPE_META[ticketType as keyof typeof TICKET_TYPE_META];
  return (
    <Badge
      variant={selected ? "default" : "secondary"}
      className={cn(
        "shrink-0 font-mono text-[10px] uppercase tracking-widest",
        className,
      )}
    >
      <span aria-hidden>{meta.emoji}</span>
      {meta.label}
    </Badge>
  );
}