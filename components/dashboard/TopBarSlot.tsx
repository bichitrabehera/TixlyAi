"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface TopBarSlotValue {
  slot: HTMLDivElement | null;
  setSlot: (el: HTMLDivElement | null) => void;
}

const TopBarSlotContext = createContext<TopBarSlotValue | null>(null);

export function TopBarSlotProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  return (
    <TopBarSlotContext.Provider value={{ slot, setSlot }}>
      {children}
    </TopBarSlotContext.Provider>
  );
}

/**
 * Container rendered on the right side of the inset frame's breadcrumb bar.
 * Pages portal page-specific actions into it via `react-dom`'s `createPortal`.
 */
export function useTopBarSlot() {
  const ctx = useContext(TopBarSlotContext);
  if (!ctx) {
    throw new Error("useTopBarSlot must be used within TopBarSlotProvider");
  }
  return ctx;
}
