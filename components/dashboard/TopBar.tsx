"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { History, KeyRound, LogOut, Plug, UserRound } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectIntegrationsDialog } from "./ConnectIntegrationsDialog";
import { HistoryDialog } from "./HistoryDialog";
import { KeyDialog } from "./KeyDialog";
import { ManageAccountDialog } from "./ManageAccountDialog";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export interface AiKeyStatus {
  hasKey: boolean;
  provider: string | null;
}

type OpenDialog = "history" | "key" | "connect" | "account" | null;

export function TopBar() {
  const { user } = useUser();
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const [keyStatus, setKeyStatus] = useState<AiKeyStatus | null>(null);

  useEffect(() => {
    fetch("/api/settings/ai-key")
      .then((res) => res.json())
      .then((data: AiKeyStatus) =>
        setKeyStatus({
          hasKey: !!data.hasKey,
          provider: data.provider || null,
        }),
      )
      .catch(() => setKeyStatus({ hasKey: false, provider: null }));
  }, []);

  const triggerClass =
    "flex items-center gap-1.5  text-sm font-medium transition-colors rounded-full p-1 border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/60 hover:text-[var(--text)]";

  return (
    <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <Link
          href="/app"
          className="text-base font-bold tracking-tight text-[var(--text)]"
        >
          Tixly
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setOpenDialog(openDialog === "history" ? null : "history")
            }
            className={triggerClass}
          >
            <History className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setOpenDialog(openDialog === "key" ? null : "key")}
            className={triggerClass}
          >
            <KeyRound className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setOpenDialog(openDialog === "connect" ? null : "connect")
            }
            className={triggerClass}
            aria-label="Connect integrations"
          >
            <Plug className="h-5 w-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-[var(--border)]/60"
              >
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "Profile"}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                ) : (
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[var(--border)] text-sm font-semibold text-[var(--muted)]">
                    {(user?.firstName || user?.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
                {user?.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.fullName || "Profile"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--border)] text-sm font-semibold text-[var(--muted)]">
                    {(user?.firstName || user?.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">
                    {user?.fullName || "User"}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setOpenDialog("key")}>
                <KeyRound className="h-4 w-4" />
                Add your key
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setOpenDialog("account")}>
                <UserRound className="h-4 w-4" />
                Manage account
              </DropdownMenuItem>
              <div className="flex items-center justify-between px-2.5 py-2">
                <span className="text-sm font-medium text-[var(--text)]/80">
                  Theme
                </span>
                <ThemeSwitcher />
              </div>
              <DropdownMenuSeparator />
              <SignOutButton>
                <div
                  role="menuitem"
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 [&_svg]:h-4 [&_svg]:w-4"
                >
                  <LogOut />
                  Logout
                </div>
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <HistoryDialog
        open={openDialog === "history"}
        onOpenChange={(open) => setOpenDialog(open ? "history" : null)}
      />
      <KeyDialog
        open={openDialog === "key"}
        onOpenChange={(open) => setOpenDialog(open ? "key" : null)}
        status={keyStatus}
        onStatusChange={setKeyStatus}
      />
      <ConnectIntegrationsDialog
        open={openDialog === "connect"}
        onOpenChange={(open) => setOpenDialog(open ? "connect" : null)}
      />
      <ManageAccountDialog
        open={openDialog === "account"}
        onOpenChange={(open) => setOpenDialog(open ? "account" : null)}
      />
    </header>
  );
}
