"use client";

import Link from "next/link";
import { useUser, UserAvatar } from "@clerk/nextjs";

export function Header() {
  const { user, isLoaded } = useUser();

  return (
    <header className="sticky p-6 z-50">
      <div className=" mx-auto w-fit rounded-full border border-slate-900/10 backdrop-blur-xl shadow-lg shadow-slate-900/5">
        <div className="flex items-center gap-1 px-2 py-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-base font-bold tracking-tight text-slate-900 transition-colors hover:bg-green-100/80 hover:text-slate-700"
          >
            Tixly
          </Link>

          <nav className="items-center flex gap-1">
            <Link
              href="#how"
              className="md:flex hidden text-sm font-medium text-slate-700 px-4 py-2 rounded-full transition-all hover:bg-green-100/80 hover:text-slate-900"
            >
              How it works
            </Link>
            <Link
              href="/pricing"
              className="md:flex hidden text-sm font-medium text-slate-700 px-4 py-2 rounded-full transition-all hover:bg-green-100/80 hover:text-slate-900"
            >
              Pricing
            </Link>

            {!isLoaded ? (
              <div className="w-8 h-8" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-green-700"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
