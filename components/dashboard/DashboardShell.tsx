"use client";

import type { ReactNode } from "react";
import { WorkspaceProvider } from "./WorkspaceBridge";
import { TopBar } from "./TopBar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        <main className="flex flex-1 flex-col bg-(--bg) min-h-0">
          <div className="flex-1 overflow-y-auto px-4 md:px-6">
            <div className="max-w-8xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </WorkspaceProvider>
  );
}
