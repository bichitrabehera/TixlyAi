"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DeleteAllTickets({ count }: { count: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/tickets", { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Failed to delete tickets");
      }
      const data = (await res.json()) as { deleted?: number };
      toast.success(
        data.deleted === 1
          ? "1 ticket deleted"
          : `${data.deleted ?? count} tickets deleted`,
      );
      setConfirming(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete tickets");
    } finally {
      setDeleting(false);
    }
  };

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="size-4" />
        Delete all
      </Button>
    );
  }

  return (
    <Alert
      variant="destructive"
      className="border-destructive/20 bg-destructive/5"
    >
      <AlertTitle>Delete all tickets?</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          This permanently deletes all {count}{" "}
          {count === 1 ? "ticket" : "tickets"} from your history. This action
          cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {deleting ? "Deleting…" : "Yes, delete everything"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
