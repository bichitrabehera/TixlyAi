"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Check, Copy, ImageIcon, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ticketToPlainText } from "@/lib/tickets/format";
import { saveSession } from "@/lib/hooks/useSessionPersistence";
import {
  TICKET_TYPES,
  TOAST_DISMISS_MS,
  type TicketType,
} from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

interface TicketDetail {
  id: string;
  generatedTicket: string;
  screenshotUrl: string | null;
  inputText: string | null;
  ticketType: string | null;
}

export function TicketDetailActions({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter();
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(
      ticketToPlainText(ticket.generatedTicket),
    );
    setCopied(true);
    toast.success("Copied ticket");
    setTimeout(() => setCopied(false), TOAST_DISMISS_MS);
  };

  const openInGenerator = () => {
    const ticketType =
      ticket.ticketType &&
      TICKET_TYPES.includes(ticket.ticketType as TicketType)
        ? (ticket.ticketType as TicketType)
        : undefined;

    saveSession(
      ticket.screenshotUrl,
      ticket.generatedTicket,
      ticket.inputText ?? "",
      ticketType,
      user?.id,
    );
    router.push(ROUTES.generate);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>

        {ticket.screenshotUrl && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowScreenshot((value) => !value)}
          >
            <ImageIcon className="size-4" />
            {showScreenshot ? "Hide screenshot" : "Show screenshot"}
          </Button>
        )}

        <Button size="sm" className="gap-2" onClick={openInGenerator}>
          <Wand2 className="size-4" />
          Open in generator
        </Button>
      </div>

      {showScreenshot && ticket.screenshotUrl && (
        <div className="rounded-xl border border-(--border) bg-(--card-2) p-3">
          <Image
            src={ticket.screenshotUrl}
            alt="Ticket screenshot"
            width={1200}
            height={675}
            className="h-auto w-full rounded-lg"
            unoptimized
          />
        </div>
      )}

      {ticket.inputText && (
        <div className="rounded-xl border border-(--border) bg-(--card-2) p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-(--muted)">
            Note
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-(--text)/90">
            {ticket.inputText}
          </p>
        </div>
      )}
    </div>
  );
}
