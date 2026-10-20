import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Ticket, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TicketListItem } from "@/components/shared/TicketListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { DeleteAllTickets } from "@/components/history/DeleteAllTickets";
import { DeleteTicketButton } from "@/components/history/DeleteTicketButton";
import { listTicketsForUser } from "@/lib/db/tickets";
import { TICKET_HISTORY_PAGE_SIZE } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.login);

  const tickets = await listTicketsForUser(userId, TICKET_HISTORY_PAGE_SIZE);

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <PageHeader
        title="Ticket history"
        subtitle={
          tickets.length === 1
            ? "1 ticket generated"
            : `${tickets.length} tickets generated`
        }
        actions={
          tickets.length > 0 ? (
            <div className="flex items-center gap-2">
              <DeleteAllTickets count={tickets.length} />
              <Button asChild size="sm" className="gap-2">
                <Link href={ROUTES.generate}>
                  <Zap className="size-4" />
                  New ticket
                </Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="gap-2">
              <Link href={ROUTES.generate}>
                <Zap className="size-4" />
                New ticket
              </Link>
            </Button>
          )
        }
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={<Ticket className="size-7" />}
          title="No tickets yet"
          description="Upload a screenshot in the generator to create your first structured ticket."
          action={
            <Button asChild className="gap-2">
              <Link href={ROUTES.generate}>
                <Zap className="size-4" />
                Generate a ticket
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <TicketListItem
              key={ticket.id}
              href={ROUTES.ticket(ticket.id)}
              ticket={{
                id: ticket.id,
                generatedTicket: ticket.generatedTicket,
                ticketType: ticket.ticketType,
                createdAt: ticket.createdAt.toISOString(),
              }}
              action={<DeleteTicketButton ticketId={ticket.id} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
