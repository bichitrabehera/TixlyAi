"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SectionCard } from "./SectionCard";

export function AccountSection({
  showMessage,
}: {
  showMessage: (type: "success" | "error", message: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" });
      if (res.ok) {
        showMessage("success", "Account data deleted");
        window.location.href = "/";
      }
    } catch {
      showMessage("error", "Failed to delete account data");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SectionCard title="Account" description="Manage your account data.">
      {!confirmDelete ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 />
          Delete account data
        </Button>
      ) : (
        <Alert
          variant="destructive"
          className="border-destructive/20 bg-destructive/5"
        >
          <AlertTitle>Are you sure?</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              This permanently deletes all your tickets and data from Tixly.
              Your Clerk account will not be affected. This action cannot be
              undone.
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                {deleting ? "Deleting..." : "Yes, delete everything"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </SectionCard>
  );
}
