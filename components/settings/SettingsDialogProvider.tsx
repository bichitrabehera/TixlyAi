"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { SettingsDialog } from "./SettingsDialog";

interface SettingsDialogValue {
  openSettings: () => void;
}

const SettingsDialogContext = createContext<SettingsDialogValue | null>(null);

function SettingsParamWatcher() {
  const searchParams = useSearchParams();
  const { openSettings } = useSettingsDialog();
  const settingsParam = searchParams.get("settings");

  useEffect(() => {
    if (!settingsParam) return;
    const t = setTimeout(() => openSettings(), 0);
    return () => clearTimeout(t);
  }, [settingsParam, openSettings]);

  return null;
}

export function SettingsDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openSettings = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openSettings }), [openSettings]);

  return (
    <SettingsDialogContext.Provider value={value}>
      {children}
      <SettingsDialog open={open} onOpenChange={setOpen} />
      <Suspense fallback={null}>
        <SettingsParamWatcher />
      </Suspense>
    </SettingsDialogContext.Provider>
  );
}

export function useSettingsDialog() {
  const ctx = useContext(SettingsDialogContext);
  if (!ctx) {
    throw new Error(
      "useSettingsDialog must be used within SettingsDialogProvider",
    );
  }
  return ctx;
}
