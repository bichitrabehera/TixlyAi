"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export function Header() {
  const { user, isLoaded } = useUser();

  return (
    <header className="fixed inset-x-0 top-0 z-50 p-6">
      <div className="mx-auto w-fit rounded-full border border-hairline bg-canvas/70 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-xl">
        <div className="flex items-center gap-1 px-2 py-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-base font-semibold tracking-tight text-ink transition-colors hover:bg-panel"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-primary bg-brand-tile">
              <Ticket className="h-3.5 w-3.5 text-ink" aria-hidden />
            </span>
            Tixly
          </Link>

          <nav className="flex items-center gap-1">
            {!isLoaded ? (
              <div className="h-8 w-8" />
            ) : user ? (
              <Button asChild className="ml-1 rounded-full px-5">
                <Link href={ROUTES.overview}>Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="ml-1 rounded-full px-5">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
