"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isLoaded } = useUser();

  return (
    <header className="fixed mx-auto top-0 left-0 right-0 p-6 z-50">
      <div className=" mx-auto w-fit rounded-full border border-slate-900/10 backdrop-blur-xl shadow-lg shadow-slate-900/5">
        <div className="flex items-center gap-1 px-2 py-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold tracking-tight text-slate-900 transition-colors hover:bg-green-100/80 hover:text-slate-700"
          >
            Tixly
          </Link>

          <nav className="items-center flex gap-1">
            {!isLoaded ? (
              <div className="w-8 h-8" />
            ) : user ? (
              <>
                <Button
                  asChild
                  className="ml-1 rounded-full bg-slate-900 px-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
                >
                  <Link href="/app">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="ml-1 rounded-full bg-slate-900 px-5 text-white shadow-sm transition-all hover:bg-green-700"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
