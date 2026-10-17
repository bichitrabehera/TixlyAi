"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { WORKSPACE_ROOT } from "@/lib/routes";

export function RouteThemeGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith(WORKSPACE_ROOT)) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [pathname]);

  return null;
}
