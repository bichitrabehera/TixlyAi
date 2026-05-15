"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Ticket, History, Settings, LogOut, Unlink } from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard/generate", label: "Generate Ticket", icon: Ticket },
  { href: "/dashboard/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [slackConnected, setSlackConnected] = useState(false);

  useEffect(() => {
    fetch("/api/slack/status")
      .then((res) => res.json())
      .then((data) => setSlackConnected(data.connected))
      .catch(() => {});
  }, []);

  const disconnectSlack = async () => {
    try {
      await fetch("/api/slack/disconnect", { method: "POST" });
      setSlackConnected(false);
    } catch (e) {
      console.error("Failed to disconnect Slack", e);
    }
  };

  return (
    <aside className="w-80 min-h-screen bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-(--text)">TixlyAi</span>
        </Link>
      </div>

      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg)]">
          <img
            src={user?.imageUrl || "https://ui-avatars.com/api/?name=User"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text)] truncate">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs text-[var(--text)]/60 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--primary)] text-white"
                      : "text-[var(--text)]/70 hover:bg-[var(--border)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-[var(--border)] space-y-1">
        {slackConnected && (
          <button
            onClick={disconnectSlack}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Unlink className="w-4 h-4" />
            Disconnect Slack
          </button>
        )}

        <ThemeToggle />

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text)]/70 hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
        >
          <Settings className="w-4 h-4" />
          Back to Home
        </Link>

        <SignOutButton>
          <a
            href="/sign-out"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text)]/70 hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </a>
        </SignOutButton>
      </div>
    </aside>
  );
}
