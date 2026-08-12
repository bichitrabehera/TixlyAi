"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History } from "lucide-react";
import { useWorkspace } from "./WorkspaceBridge";
import {
  TICKET_TYPE_META,
  TICKET_TITLE_TRUNCATE_LENGTH,
} from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TicketData {
  id: string;
  screenshotUrl: string | null;
  inputText: string | null;
  generatedTicket: string;
  ticketType: string | null;
  createdAt: string;
}

function extractTicketTitle(ticket: string): string {
  try {
    const parsed = JSON.parse(ticket) as { title?: string };
    if (parsed.title) return parsed.title;
  } catch {}
  const match = ticket.match(/🐛\s*(.*)/);
  if (match) return match[1];
  return (
    ticket.slice(0, TICKET_TITLE_TRUNCATE_LENGTH) +
    (ticket.length > TICKET_TITLE_TRUNCATE_LENGTH ? "..." : "")
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { loadTicket } = useWorkspace();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data: { tickets?: TicketData[] }) => {
        if (!cancelled) setTickets(data.tickets || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSelect = (ticket: TicketData) => {
    loadTicket({
      generatedTicket: ticket.generatedTicket,
      screenshotUrl: ticket.screenshotUrl,
      inputText: ticket.inputText,
      ticketType: ticket.ticketType,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[70vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--muted)]" />
            Recent tickets
          </DialogTitle>
          <DialogDescription>
            Select a previous ticket to restore it in the workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">
              Loading...
            </div>
          ) : tickets.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">
              No tickets yet
            </div>
          ) : (
            tickets.map((ticket) => {
              const meta =
                ticket.ticketType && ticket.ticketType in TICKET_TYPE_META
                  ? TICKET_TYPE_META[
                      ticket.ticketType as keyof typeof TICKET_TYPE_META
                    ]
                  : null;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => handleSelect(ticket)}
                  className="block w-full border-b border-[var(--border)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--border)]/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[var(--text)]">
                      {extractTicketTitle(ticket.generatedTicket)}
                    </p>
                    {meta && (
                      <span className="shrink-0 rounded-full bg-[var(--border)]/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
                        {meta.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {formatDate(ticket.createdAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Link
            href="/app/history"
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium text-black bg-green-500 p-2 rounded border border-[var(--muted)]/30"
          >
            View full history
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
