"use client";

import { Slack } from "developer-icons";
import { RotateCcw, Copy, Check } from "lucide-react";
import { useState } from "react";
import { TicketCard } from "@/components/TicketCard";
import { TOAST_DISMISS_MS } from "@/lib/constants";

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
    setTimeout(() => setCopied(false), TOAST_DISMISS_MS);
  };

  return (
    <div className="w-full max-w-3xl mx-auto overflow-y-auto">
      {ticket ? (
        <div className="space-y-3">
          {/* Ticket content */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] px-6 py-5">
            <TicketCard ticketText={ticket} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={handleCopy}
              disabled={disabled}
              className="text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>

            {slackConnected && (
              <button
                onClick={onSendToSlack}
                disabled={disabled || slackLoading || slackSent}
                className="text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
              >
                {slackLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : slackSent ? (
                  "✓ Sent to Slack"
                ) : (
                  "Send to Slack"
                )}
              </button>
            )}

            {linearConnected && (
              <button
                onClick={onSendToLinear}
                disabled={disabled || linearLoading || linearSent}
                className="text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
              >
                {linearLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : linearSent ? (
                  "✓ Created in Linear"
                ) : (
                  "Send to Linear"
                )}
              </button>
            )}

            <div className="flex-1" />

            <button
              onClick={onReset}
              disabled={disabled}
              className="text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--muted)] hover:text-[var(--text)]"
            >
              New ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-32 text-sm text-[var(--muted)]">
          <p>Upload a screenshot to generate a ticket</p>
        </div>
      )}
    </div>
  );
}
