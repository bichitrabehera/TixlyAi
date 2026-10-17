import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/TicketCard";
import { getTicketForUser } from "@/lib/db/tickets";
import {
  extractTicketTitle,
  formatTicketDate,
  ticketDisplayId,
} from "@/lib/tickets/format";
import { ROUTES } from "@/lib/routes";
import { TicketDetailActions } from "./_components/TicketDetailActions";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect(ROUTES.login);

  const { id } = await params;
  const ticket = await getTicketForUser(id, userId);
  if (!ticket) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl pb-16">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 mb-1 gap-1.5 text-(--muted)"
      >
        <Link href={ROUTES.history}>
          <ArrowLeft className="size-4" />
          History
        </Link>
      </Button>

      <PageHeader
        title={extractTicketTitle(ticket.generatedTicket, 90)}
        subtitle={`${ticketDisplayId(ticket.generatedTicket)} · ${formatTicketDate(
          ticket.createdAt.toISOString(),
        )}`}
      />

      <TicketDetailActions
        ticket={{
          id: ticket.id,
          generatedTicket: ticket.generatedTicket,
          screenshotUrl: ticket.screenshotUrl,
          inputText: ticket.inputText,
          ticketType: ticket.ticketType,
        }}
      />

      <div className="mt-6">
        <TicketCard ticketText={ticket.generatedTicket} />
      </div>
    </div>
  );
}
