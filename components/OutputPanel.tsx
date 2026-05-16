"use client";

import { Slack } from "developer-icons";
import { RotateCcw, Copy, Check } from "lucide-react";
import { useState } from "react";
import { TicketCard } from "@/components/TicketCard";

interface OutputPanelProps {
  ticket: string;
  onCopy: () => void;
  onReset: () => void;
  onSendToSlack: () => Promise<void>;
  slackLoading: boolean;
  slackSent: boolean;
  slackConnected: boolean;
  onSendToLinear: () => Promise<void>;
  linearLoading: boolean;
  linearSent: boolean;
  linearConnected: boolean;
  disabled: boolean;
}

export function OutputPanel({
  ticket,
  onCopy,
  onReset,
  onSendToSlack,
  slackLoading,
  slackSent,
  slackConnected,
  onSendToLinear,
  linearLoading,
  linearSent,
  linearConnected,
  disabled,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="flex flex-col h-full rounded bg-(--card) border border-(--border) overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-(--border) flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-(--text)">
            Generated Ticket
          </h2>
          <p className="text-sm text-(--text)/50 mt-1">
            Structured issue report
          </p>
        </div>

        {ticket && (
          <button
            onClick={handleCopy}
            disabled={disabled}
            className="flex items-center gap-2 rounded-xl border border-(--border) bg-(--bg) px-4 py-2 text-sm font-medium text-(--text) transition-all hover:bg-(--border)/40"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {ticket ? (
          <TicketCard ticketText={ticket} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-20 text-center">
            <h3 className="mb-2 text-lg font-medium text-(--text)">
              No ticket generated
            </h3>

            <p className="max-w-sm text-sm text-(--text)/40">
              Upload a screenshot and describe the issue to generate a clean
              structured ticket.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {ticket && (
        <div className="p-6 pt-0">
          <div className="flex flex-wrap gap-3">
            {slackConnected && (
              <button
                onClick={onSendToSlack}
                disabled={disabled || slackLoading || slackSent}
                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl 
  bg-[var(--text)] px-4 py-3 text-sm font-medium text-[var(--card)] 
  transition-all hover:opacity-90 disabled:opacity-50"
              >
                <Slack className="h-4 w-4" />

                {slackLoading
                  ? "Sending..."
                  : slackSent
                    ? "Sent to Slack"
                    : "Send to Slack"}
              </button>
            )}

            {linearConnected && (
              <button
                onClick={onSendToLinear}
                disabled={disabled || linearLoading || linearSent}
                className="flex flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl bg-(--text) px-4 py-3 text-sm font-medium text-(--card) transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {linearLoading
                  ? "Sending..."
                  : linearSent
                    ? "Sent to Linear"
                    : "Send to Linear"}
              </button>
            )}

            <button
              onClick={onReset}
              disabled={disabled}
              className="flex items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--bg) px-4 py-3 text-sm font-medium text-(--text) transition-all hover:bg-(--border)/40 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
