"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteThemeGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [pathname]);

  return null;
}