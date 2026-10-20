import Link from "next/link";
import { cn } from "@/lib/utils";
import { TicketTypeBadge } from "./TicketTypeBadge";
import {
  extractTicketTitle,
  formatTicketDate,
  ticketDisplayId,
} from "@/lib/tickets/format";

export function TicketListItem({
  ticket,
  href,
  className,
  action,
}: {
  ticket: {
    id: string | number;
    generatedTicket: string;
    ticketType: string | null;
    createdAt: string;
  };
  href: string;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/ticket relative flex w-full items-start rounded-lg border border-(--border) transition-colors hover:border-primary/30 hover:bg-primary/5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
    >
      <Link
        href={href}
        className="flex min-w-0 flex-1 flex-col gap-1.5 px-3.5 py-3 focus-visible:outline-none"
      >
        <div className="flex items-center gap-2 pr-8">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-(--text)">
            {extractTicketTitle(ticket.generatedTicket)}
          </p>
          <TicketTypeBadge ticketType={ticket.ticketType} />
        </div>
        <div className="flex items-center gap-2 text-xs text-(--muted)">
          <span className="font-mono">
            {ticketDisplayId(ticket.generatedTicket)}
          </span>
          <span aria-hidden>·</span>
          <span>{formatTicketDate(ticket.createdAt)}</span>
        </div>
      </Link>
      {action ? (
        <div className="absolute right-2.5 top-2.5">{action}</div>
      ) : null}
    </div>
  );
}
