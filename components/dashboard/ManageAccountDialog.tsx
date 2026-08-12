"use client";

import { UserProfile } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export function ManageAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] max-w-4xl overflow-hidden p-0">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "h-full w-full shadow-none",
              cardBox: "h-full w-full shadow-none",
              card: "h-full w-full rounded-none border-0 shadow-none",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
