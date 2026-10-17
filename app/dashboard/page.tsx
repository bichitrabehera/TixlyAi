import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { History, Sparkles, Ticket, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { TicketListItem } from "@/components/shared/TicketListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { listTicketsForUser } from "@/lib/db/tickets";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

const RECENT_LIMIT = 5;

export default async function OverviewPage() {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.login);

  const [user, tickets] = await Promise.all([
    currentUser(),
    listTicketsForUser(userId, RECENT_LIMIT),
  ]);

  const name = user?.firstName || user?.username;

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <PageHeader
        title={name ? `Welcome back, ${name}` : "Welcome back"}
        subtitle="Turn screenshots into structured tickets in seconds."
      />

      <section className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <Sparkles className="size-3.5" />
          New ticket
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-(--text)">
          Generate a ticket from a screenshot
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-6 text-(--muted)">
          Capture a bug or feature request, and Tixly drafts a clean, structured
          ticket ready for Slack or Linear.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href={ROUTES.generate}>
              <Zap className="size-4" />
              Start generating
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href={ROUTES.history}>
              <History className="size-4" />
              View history
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold tracking-tight text-(--text)">
            Recent tickets
          </h2>
          {tickets.length > 0 && (
            <Link
              href={ROUTES.history}
              className="text-sm font-medium text-(--muted) transition-colors hover:text-(--text)"
            >
              View all
            </Link>
          )}
        </div>

        {tickets.length === 0 ? (
          <EmptyState
            icon={<Ticket className="size-7" />}
            title="No tickets yet"
            description="Your generated tickets will show up here."
            className="rounded-2xl border border-dashed border-(--border) py-16"
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
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
