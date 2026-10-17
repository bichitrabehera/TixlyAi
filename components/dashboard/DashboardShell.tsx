"use client";

import type { ReactNode } from "react";
import { SettingsDialogProvider } from "@/components/settings/SettingsDialogProvider";
import { CommandPaletteProvider } from "./CommandPalette";
import { WorkspaceProvider } from "./WorkspaceBridge";
import { TopBar } from "./TopBar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <SettingsDialogProvider>
        <CommandPaletteProvider>
          <div className="flex h-screen flex-col overflow-hidden">
            <TopBar />
            <main className="flex flex-1 flex-col bg-(--bg) min-h-0">
              <div className="flex-1 overflow-y-auto px-4 md:px-6">
                <div className="mx-auto">{children}</div>
              </div>
            </main>
          </div>
        </CommandPaletteProvider>
      </SettingsDialogProvider>
    </WorkspaceProvider>
  );
}
