"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { CommandPaletteProvider } from "./CommandPalette";
import { WorkspaceProvider } from "./WorkspaceBridge";
import { AppSidebar } from "./AppSidebar";
import { TopBarSlotProvider, useTopBarSlot } from "./TopBarSlot";
import { ROUTES, WORKSPACE_ROOT } from "@/lib/routes";

function breadcrumbLabel(pathname: string): string {
  if (pathname.startsWith(ROUTES.generate)) return "Ticket Generator";
  if (pathname.startsWith(`${WORKSPACE_ROOT}/tickets`)) return "Ticket";
  if (pathname.startsWith(ROUTES.history)) return "History";
  if (pathname.startsWith(ROUTES.settings)) return "Settings";
  if (pathname.startsWith(ROUTES.playground)) return "Playground";
  if (pathname === ROUTES.overview) return "Overview";
  return "Workspace";
}

function InsetFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setSlot } = useTopBarSlot();
  const [isMobile, setIsMobile] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const sidebarOpen = isMobile ? mobileOpen : desktopOpen;
  const toggleSidebar = () => {
    if (isMobile) setMobileOpen((value) => !value);
    else setDesktopOpen((value) => !value);
  };

  return (
    <div className="flex h-screen w-screen select-none overflow-hidden bg-shell font-sans text-ink">
      {sidebarOpen && (
        <>
          <button
            type="button"
            aria-label="Close sidebar"
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          />
          <AppSidebar className="max-lg:fixed max-lg:inset-y-2 max-lg:left-2 max-lg:z-40 max-lg:shadow-xl" />
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden rounded-none md:rounded-xl border border-hairline bg-canvas shadow-[0_1px_3px_rgba(0,0,0,0.02)] select-text m-0 lg:m-2">
        <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              aria-expanded={sidebarOpen}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-panel hover:text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              <PanelLeft className="h-4 w-4" aria-hidden />
            </button>
            <span
              className="hidden h-3.5 w-[1px] bg-hairline sm:block"
              aria-hidden
            />

            <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-hairline bg-panel px-2 py-1 text-xs font-medium text-ink">
              Tixly
            </span>

            <span className="hidden text-ink-3 sm:block" aria-hidden>
              /
            </span>
            <span className="truncate text-xs text-muted">
              {breadcrumbLabel(pathname)}
            </span>
          </div>

          <div
            ref={setSlot}
            className="flex shrink-0 items-center gap-1.5 sm:gap-2"
          />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <CommandPaletteProvider>
        <TopBarSlotProvider>
          <InsetFrame>{children}</InsetFrame>
        </TopBarSlotProvider>
      </CommandPaletteProvider>
    </WorkspaceProvider>
  );
}
