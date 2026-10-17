import Link from "next/link";
import { cn } from "@/lib/utils";
import { TicketTypeBadge } from "./TicketTypeBadge";
import { extractTicketTitle, formatTicketDate, ticketDisplayId } from "@/lib/tickets/format";

export function TicketListItem({
  ticket,
  href,
  className,
}: {
  ticket: {
    id: string | number;
    generatedTicket: string;
    ticketType: string | null;
    createdAt: string;
  };
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-full flex-col gap-1.5 rounded-xl border border-(--border) px-3.5 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-(--text)">
          {extractTicketTitle(ticket.generatedTicket)}
        </p>
        <TicketTypeBadge ticketType={ticket.ticketType} />
      </div>
      <div className="flex items-center gap-2 text-xs text-(--muted)">
        <span className="font-mono">{ticketDisplayId(ticket.generatedTicket)}</span>
        <span aria-hidden>·</span>
        <span>{formatTicketDate(ticket.createdAt)}</span>
      </div>
    </Link>
  );
}
