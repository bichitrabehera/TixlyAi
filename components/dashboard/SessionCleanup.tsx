"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { SESSION_KEY } from "@/lib/constants";

export function SessionCleanup() {
  const { userId } = useAuth();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    if (prevUserId && prevUserId !== userId) {
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
    }
    prevUserIdRef.current = userId ?? null;
  }, [userId]);

  return null;
}
