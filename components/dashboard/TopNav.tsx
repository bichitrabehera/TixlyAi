"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_PRIMARY } from "@/lib/routes";

export function TopNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={cn("items-center gap-1", className)}>
      {NAV_PRIMARY.map((item) => {
        const active = item.isActive(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
              active
                ? "bg-primary/10 text-primary"
                : "text-(--muted) hover:bg-(--border)/40 hover:text-(--text)",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
