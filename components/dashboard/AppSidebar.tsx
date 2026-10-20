"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MoreHorizontal, Ticket } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ManageAccountDialog } from "@/components/dashboard/ManageAccountDialog";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useCommandPalette } from "@/components/dashboard/CommandPalette";
import { ROUTES, WORKSPACE_ROOT } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface NavEntry {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavEntry[] = [
  {
    label: "Overview",
    href: ROUTES.overview,
    isActive: (pathname) => pathname === ROUTES.overview,
  },
  {
    label: "Generate",
    href: ROUTES.generate,
    isActive: (pathname) => pathname.startsWith(ROUTES.generate),
  },
  {
    label: "History",
    href: ROUTES.history,
    isActive: (pathname) =>
      pathname.startsWith(ROUTES.history) ||
      pathname.startsWith(`${WORKSPACE_ROOT}/tickets`),
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    isActive: (pathname) => pathname.startsWith(ROUTES.settings),
  },
];

function NavLink({ item, pathname }: { item: NavEntry; pathname: string }) {
  const active = item.isActive(pathname);
  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-9 w-full items-center rounded-lg px-3 text-sm transition-colors",
        active
          ? "bg-nav-active font-medium text-nav-active-fg"
          : "text-muted hover:bg-panel hover:text-ink",
      )}
      aria-current={active ? "page" : undefined}
    >
      {item.label}
    </Link>
  );
}

export function AppSidebar({ className }: { className?: string }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const { openPalette } = useCommandPalette();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col justify-between bg-shell p-4 lg:w-72",
        className,
      )}
    >
      <div className="space-y-6">
        <Link href="/dashboard" className="flex h-9 items-center gap-2.5 px-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary/30 bg-brand-tile">
            <Ticket className="h-4 w-4 text-ink" aria-hidden />
          </span>
          <span className="text-sm font-bold tracking-tight text-ink">
            Tixly
          </span>
        </Link>

        <button
          type="button"
          onClick={openPalette}
          className="flex h-9 w-full items-center justify-between rounded-lg border border-control-border bg-canvas px-3 text-sm text-ink-3 transition-colors hover:border-dash hover:text-muted"
        >
          <span>Search…</span>
          <kbd className="rounded bg-shell px-1.5 py-0.5 font-mono text-[10px] text-muted">
            ⌘K
          </kbd>
        </button>

        <nav className="space-y-1" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} item={item} pathname={pathname} />
          ))}
        </nav>
      </div>

      <div className="space-y-2">
        <Link
          href={`${ROUTES.settings}?section=integrations`}
          className="flex h-9 w-full items-center rounded-lg px-3 text-sm text-muted transition-colors hover:bg-panel hover:text-ink"
        >
          Integrations
        </Link>

        <Link
          href={ROUTES.docs}
          className="flex h-9 w-full items-center rounded-lg px-3 text-sm text-muted transition-colors hover:bg-panel hover:text-ink"
        >
          Help &amp; Support
        </Link>

        <div className="flex min-h-14 items-center gap-3 rounded-lg border border-hairline px-3 py-2">
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full"
            />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-track text-xs font-semibold text-muted">
              {(user?.firstName || user?.username || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {user?.fullName || user?.username || "Account"}
            </p>
            <p className="truncate text-xs text-ink-3">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-hairline hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuLabel className="px-3 py-2 text-sm">
                {user?.fullName || "Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setAccountOpen(true)}>
                Manage account
              </DropdownMenuItem>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted">Theme</span>
                <ThemeSwitcher />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => signOut({ redirectUrl: "/" })}
                className="text-destructive focus:text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ManageAccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
    </aside>
  );
}
