"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  History,
  Search,
  Settings,
  Sparkles,
  Ticket,
  Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useSettingsDialog } from "@/components/settings/SettingsDialogProvider";
import { extractTicketTitle, ticketDisplayId } from "@/lib/tickets/format";

interface CommandPaletteValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openPalette: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider",
    );
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openPalette = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, openPalette }),
    [open, openPalette],
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0 [&>button]:hidden">
          <DialogTitle className="sr-only">Command menu</DialogTitle>
          <CommandPaletteBody onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </CommandPaletteContext.Provider>
  );
}

interface TicketHit {
  id: string;
  generatedTicket: string;
}

interface PaletteItem {
  id: string;
  label: string;
  group: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
}

function CommandPaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { openSettings } = useSettingsDialog();
  const [query, setQuery] = useState("");
  const [tickets, setTickets] = useState<TicketHit[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data: { tickets?: TicketHit[] }) => {
        if (!cancelled) setTickets((data.tickets ?? []).slice(0, 5));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo<PaletteItem[]>(() => {
    const navigate: PaletteItem[] = [
      {
        id: "nav-overview",
        label: "Go to Overview",
        group: "Navigate",
        icon: <Sparkles className="size-4" />,
        run: () => router.push(ROUTES.overview),
      },
      {
        id: "nav-generate",
        label: "Generate a ticket",
        group: "Navigate",
        icon: <Zap className="size-4" />,
        run: () => router.push(ROUTES.generate),
      },
      {
        id: "nav-history",
        label: "Ticket history",
        group: "Navigate",
        icon: <History className="size-4" />,
        run: () => router.push(ROUTES.history),
      },
    ];

    const actions: PaletteItem[] = [
      {
        id: "act-settings",
        label: "Open settings",
        group: "Actions",
        hint: "API keys, integrations",
        icon: <Settings className="size-4" />,
        run: openSettings,
      },
    ];

    const recent: PaletteItem[] = tickets.map((ticket) => ({
      id: `ticket-${ticket.id}`,
      label: extractTicketTitle(ticket.generatedTicket),
      group: "Recent tickets",
      hint: ticketDisplayId(ticket.generatedTicket),
      icon: <Ticket className="size-4" />,
      run: () => router.push(ROUTES.ticket(ticket.id)),
    }));

    return [...navigate, ...actions, ...recent];
  }, [router, openSettings, tickets]);

  const needle = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return items;
    return items.filter((item) =>
      `${item.label} ${item.group} ${item.hint ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [items, needle]);

  const clampedActive =
    filtered.length === 0 ? 0 : Math.min(active, filtered.length - 1);

  const run = useCallback(
    (item?: PaletteItem) => {
      const target = item ?? filtered[clampedActive];
      if (!target) return;
      onClose();
      target.run();
    },
    [filtered, clampedActive, onClose],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(clampedActive + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(clampedActive - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      run();
    }
  };

  let lastGroup = "";

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-(--border) px-4">
        <Search className="size-4 shrink-0 text-(--muted)" />
        <Input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search or jump to…"
          className="h-12 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0 focus-visible:border-0"
        />
        <kbd className="hidden shrink-0 rounded border border-(--border) px-1.5 py-0.5 text-[10px] font-medium text-(--muted) sm:block">
          ESC
        </kbd>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-(--muted)">
            No results
          </p>
        ) : (
          filtered.map((item, index) => {
            const header = item.group !== lastGroup ? item.group : null;
            lastGroup = item.group;
            const isActive = index === clampedActive;

            return (
              <div key={item.id}>
                {header && (
                  <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-(--muted)">
                    {header}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => run(item)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-(--text)"
                      : "text-(--text)/80 hover:bg-(--border)/40",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0",
                      isActive ? "text-primary" : "text-(--muted)",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="shrink-0 font-mono text-[11px] text-(--muted)">
                      {item.hint}
                    </span>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
