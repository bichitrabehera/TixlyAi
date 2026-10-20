"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteTicketButton({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        "Delete this ticket? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Failed to delete ticket");
      }
      toast.success("Ticket deleted");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete ticket",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 shrink-0 text-(--muted) opacity-0 transition-opacity group-hover/ticket:opacity-100 focus-visible:opacity-100 hover:text-(--destructive) hover:bg-(--destructive)/10"
      onClick={handleDelete}
      disabled={deleting}
      aria-label="Delete ticket"
    >
      {deleting ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
    </Button>
  );
}
