"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket, Copy, Check, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/dashboard/Header";
import { TicketCard } from "@/components/TicketCard";
import { ticketToPlainText } from "@/lib/tickets/format";
import { Image as ImageIcon } from "lucide-react";

interface TicketData {
  id: number;
  screenshotUrl: string | null;
  inputText: string | null;
  generatedTicket: string;
  createdAt: string;
}

function extractTicketTitle(ticket: string): string {
  try {
    const parsed = JSON.parse(ticket);
    if (parsed.title) return parsed.title;
  } catch {}
  const match = ticket.match(/🐛\s*(.*)/);
  if (match) return match[1];
  return ticket.slice(0, 60) + (ticket.length > 60 ? "..." : "");
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardHistory() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
      if (data.tickets?.length > 0 && !selectedTicket) {
        setSelectedTicket(data.tickets[0]);
      }
    } catch (e) {
      console.error("Failed to fetch tickets", e);
    } finally {
      setLoading(false);
    }
  }, [selectedTicket]);

  useEffect(() => {
    setTimeout(() => fetchTickets(), 0);
  }, [fetchTickets]);

  const copyToClipboard = async () => {
    if (!selectedTicket) return;
    await navigator.clipboard.writeText(
      ticketToPlainText(selectedTicket.generatedTicket),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-(--text)/60">Loading tickets...</div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Ticket History"
        subtitle={
          tickets.length === 1
            ? "1 ticket generated"
            : `${tickets.length} tickets generated`
        }
      >
        <Link
          href="/dashboard/generate"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#001d52] text-white hover:opacity-90 transition-all"
        >
          <Zap className="w-4 h-4" />
          New Ticket
        </Link>
      </Header>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#001d52]/10">
            <Ticket className="w-7 h-7 text-[#001d52]" />
          </div>
          <h3 className="text-lg font-semibold text-(--text) mb-2">
            No tickets yet
          </h3>
          <p className="text-sm text-(--text)/50 max-w-md mb-6">
            Upload a screenshot on the Generate page to create your first
            structured ticket.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/generate"
              className="px-5 py-2.5 bg-[#001d52] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            >
              Generate Ticket
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar list */}
          <div className="space-y-1">
            {tickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-[#001d52] text-white"
                      : "hover:bg-(--border)/40 text-(--text)/70"
                  }`}
                >
                  <p className="text-sm font-medium truncate">
                    {extractTicketTitle(ticket.generatedTicket)}
                  </p>
                  <p className="text-xs mt-0.5 text-white/40">
                    {formatDate(ticket.createdAt)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Main content */}
          <div className="lg:col-span-1 mx-auto">
            {selectedTicket ? (
              <div className="max-w-3xl">
                {/* Header with actions */}
                <div className="flex items-center gap-2 mb-6">
                  {selectedTicket.screenshotUrl && (
                    <button
                      onClick={() => setShowScreenshot(!showScreenshot)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) hover:bg-(--border)/40 text-(--text)/70 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {showScreenshot ? "Hide" : "Show"} Screenshot
                    </button>
                  )}
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-(--border) hover:bg-(--border)/40 text-(--text)/70 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Screenshot (collapsible) */}
                {showScreenshot && selectedTicket.screenshotUrl && (
                  <div className="mb-6 p-3 bg-(--bg) rounded-lg border border-(--border)">
                    <Image
                      src={selectedTicket.screenshotUrl}
                      alt="Screenshot"
                      width={800}
                      height={450}
                      className="rounded w-full h-auto"
                      unoptimized
                    />
                  </div>
                )}

                {/* Note */}
                {selectedTicket.inputText && (
                  <div className="mb-6 pb-6 border-b border-(--border)">
                    <p className="text-xs font-medium text-(--text)/40 mb-2">
                      Note
                    </p>
                    <p className="text-sm text-(--text)/80 leading-relaxed">
                      {selectedTicket.inputText}
                    </p>
                  </div>
                )}

                {/* Ticket */}
                <div>
                  <p className="text-xs font-medium text-(--text)/40 mb-3">
                    Ticket Details
                  </p>
                  <TicketCard ticketText={selectedTicket.generatedTicket} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-(--text)/30 text-sm">
                Select a ticket to view details
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
