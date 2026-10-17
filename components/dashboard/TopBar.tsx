"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HistoryIcon,
  LogOut,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopNav } from "./TopNav";
import { ManageAccountDialog } from "./ManageAccountDialog";
import { useSettingsDialog } from "@/components/settings/SettingsDialogProvider";
import { useCommandPalette } from "./CommandPalette";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ROUTES } from "@/lib/routes";

export function TopBar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { openSettings } = useSettingsDialog();
  const { openPalette } = useCommandPalette();
  const [accountOpen, setAccountOpen] = useState(false);

  const triggerClass = "rounded-full";

  return (
    <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-border bg-background">
      <div className="flex h-full items-center gap-3 px-4 md:px-6">
        <Link
          href={ROUTES.overview}
          className="text-base font-bold tracking-tight text-foreground"
        >
          Tixly
        </Link>

        {/* <TopNav className="hidden md:flex" /> */}

        <div className="ml-auto flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={triggerClass}
                aria-label="Settings"
                onClick={openSettings}
              >
                <Settings />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={triggerClass}
              >
                <Link href="/dashboard/generate">
                  <Sparkles />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Generate</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={triggerClass}
              >
                <Link href="/dashboard/history">
                  <HistoryIcon />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full"
                aria-label="Account menu"
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
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-border text-sm font-semibold text-muted">
                    {(user?.firstName || user?.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </Button>
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
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-border text-sm font-semibold text-muted">
                    {(user?.firstName || user?.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.fullName || "User"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={openSettings}>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAccountOpen(true)}>
                <UserRound />
                Manage account
              </DropdownMenuItem>
              <div className="flex items-center justify-between px-2.5 py-2">
                <span className="text-sm font-medium text-foreground/80">
                  Theme
                </span>
                <ThemeSwitcher />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => signOut({ redirectUrl: "/" })}
                className="text-destructive focus:text-destructive [&_svg]:text-destructive"
              >
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ManageAccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </header>
  );
}
