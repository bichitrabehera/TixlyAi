"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex w-64 shrink-0" />

      <MobileHeader onMenuClick={openSidebar} />

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="flex-1 flex flex-col bg-(--bg) pt-14 md:pt-0">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="max-w-8xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
