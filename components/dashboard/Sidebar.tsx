"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Ticket, History, Settings, LogOut } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";

const navItems = [
  { href: "/dashboard/generate", label: "Generate Ticket", icon: Ticket },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const [slackConnected, setSlackConnected] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);

  const checkStatus = () => {
    fetch("/api/slack/status")
      .then((r) => r.json())
      .then((d) => setSlackConnected(d.connected))
      .catch(() => {});

    fetch("/api/integrations/linear/keys")
      .then((r) => r.json())
      .then((d) => setLinearConnected(d.connected))
      .catch(() => {});
  };

  useEffect(() => {
    checkStatus();

    window.addEventListener("focus", checkStatus);
    return () => window.removeEventListener("focus", checkStatus);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleNavClick = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`flex w-64 fixed z-50 min-h-screen bg-(--card) border-r border-(--border) flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 border-b border-(--border)">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-(--text)">Tixly</span>
          </Link>
        </div>
        <div className="p-4 border-b border-(--border)">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Image
              src={user?.imageUrl || "https://ui-avatars.com/api/?name=User"}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--text) truncate">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-(--text)/60 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
        <nav className="p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#001d52] text-white"
                        : "text-(--text)/70 hover:bg-(--border) hover:text-(--text)"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 pt-6 border-t border-(--border)">
            <p className="px-3 mb-2 text-xs font-medium text-(--text)/40 uppercase tracking-wider">
              Connected Apps
            </p>
            <div className="space-y-1 px-3">
              {[
                {
                  icon: <Slack className="w-4 h-4" />,
                  label: "Slack",
                  connected: slackConnected,
                },
                {
                  icon: <CgLinear className="w-4 h-4" />,
                  label: "Linear",
                  connected: linearConnected,
                },
              ].map(({ icon, label, connected }) => (
                <div
                  key={label}
                  className="flex items-center justify-start gap-3 py-2"
                >
                  <span className="text">{icon}</span>
                  <span className="text-sm text-(--text)/60">{label}</span>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      connected
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-(--text)/5 text-(--text)/30"
                    }`}
                  >
                    {connected ? "Connected" : "Not connected"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>{" "}
        <div className="p-4 border-t border-(--border) ">
          <ThemeToggle />

          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-(--text)/70 hover:bg-(--border) hover:text-(--text) transition-colors"
          >
            <Settings className="w-4 h-4" />
            Back to Home
          </Link>

          <SignOutButton>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-(--text)/70 hover:bg-(--border) hover:text-(--text) transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              Sign Out
            </div>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}
