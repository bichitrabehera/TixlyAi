"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-(--card) border-b border-(--border) md:hidden">
      <Link href="/dashboard" className="font-bold text-(--text)">
        Tixly
      </Link>
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-(--text)/70 hover:bg-(--border) transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
}
