"use client";

import { useState, useEffect, useCallback } from "react";
import { Ticket, Copy, Zap } from "lucide-react";
import Link from "next/link";
import Header from "@/components/dashboard/Header";

interface TicketData {
  id: number;
  screenshotUrl: string | null;
  inputText: string | null;
  generatedTicket: string;
  createdAt: string;
}

export default function DashboardHistory() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
    fetchTickets();
  }, [fetchTickets]);

  const copyToClipboard = async () => {
    if (!selectedTicket) return;
    await navigator.clipboard.writeText(selectedTicket.generatedTicket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const extractTitle = (ticket: string) => {
    const match = ticket.match(/🐛 Title: (.*)/);
    return match ? match[1] : ticket.slice(0, 50) + "...";
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[var(--text)]/60">Loading tickets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <Header
          title="Ticket History"
          subtitle={`${tickets.length} tickets generated`}
        >
          <Link
            href="/dashboard/generate"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium 
    bg-[var(--primary)] text-black hover:opacity-90 transition"
          >
            <Zap className="w-4 h-4" />
            New Ticket
          </Link>
        </Header>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[var(--border)] rounded-full flex items-center justify-center mb-4">
              <Ticket className="w-8 h-8 text-[var(--text)]/40" />
            </div>
            <h3 className="text-lg font-medium text-[var(--text)] mb-2">
              No tickets yet
            </h3>
            <p className="text-[var(--text)]/60 mb-6">
              Generate your first ticket to see it here
            </p>
            <Link
              href="/dashboard/generate"
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
            >
              Generate Ticket
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2 ">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTicket?.id === ticket.id
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                      : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-medium text-sm truncate ${
                          selectedTicket?.id === ticket.id
                            ? "text-white"
                            : "text-[var(--text)]"
                        }`}
                      >
                        {extractTitle(ticket.generatedTicket)}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          selectedTicket?.id === ticket.id
                            ? "text-white/90"
                            : "text-[var(--text)]/60"
                        }`}
                      >
                        {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    {selectedTicket?.id === ticket.id && (
                      <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedTicket ? (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      
                      <p className="text font-bold text-[var(--text)]/60">
                        {extractTitle(selectedTicket.generatedTicket)}
                      </p>
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--border)] hover:bg-[var(--text)]/10 text-[var(--text)]/80 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {selectedTicket.screenshotUrl && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-[var(--text)]/60 uppercase mb-2">
                        Screenshot
                      </p>
                      <div className="border border-[var(--border)] rounded-lg overflow-hidden max-w-md">
                        <img
                          src={selectedTicket.screenshotUrl}
                          alt="Screenshot"
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}

                  {selectedTicket.inputText && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-[var(--text)]/60 uppercase mb-2">
                        Note
                      </p>
                      <p className="text-sm text-[var(--text)] bg-[var(--bg)] rounded-lg p-3">
                        {selectedTicket.inputText}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-[var(--text)]/60 uppercase mb-2">
                      Generated Ticket
                    </p>
                    <pre className="text-sm text-[var(--text)] whitespace-pre-wrap font-sans bg-[var(--bg)] rounded-lg p-4">
                      {selectedTicket.generatedTicket}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-[var(--text)]/40">
                  Select a ticket to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
