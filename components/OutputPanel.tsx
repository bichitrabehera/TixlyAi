"use client";

import { Slack } from "developer-icons";
import { RotateCcw, Copy, Check } from "lucide-react";
import { useState } from "react";
import { TicketCard } from "@/components/TicketCard";
import { TOAST_DISMISS_MS } from "@/lib/constants";
import { CgLinear } from "react-icons/cg";

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

          <div className="flex items-center gap-2 px-1">
            {/* Copy */}
            <button
              onClick={handleCopy}
              disabled={disabled}
              title="Copy ticket"
              className="p-2 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)] "
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <div className="">
              {(slackConnected || linearConnected) && (
                <span className="text-sm text-[var(--muted)] ml-2">
                  Send to
                </span>
              )}

              {slackConnected && (
                <button
                  onClick={onSendToSlack}
                  disabled={disabled || slackLoading || slackSent}
                  title="Send to Slack"
                  className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
                >
                  {slackLoading ? (
                    <span className="w-4 h-4 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin block" />
                  ) : slackSent ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Slack className="w-4 h-4" />
                  )}
                </button>
              )}

              {linearConnected && (
                <button
                  onClick={onSendToLinear}
                  disabled={disabled || linearLoading || linearSent}
                  title="Create in Linear"
                  className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text)]"
                >
                  {linearLoading ? (
                    <span className="w-4 h-4 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin block" />
                  ) : linearSent ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <CgLinear className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <div className="flex-1" />

            {/* New Ticket */}
            <button
              onClick={onReset}
              disabled={disabled}
              title="New ticket"
              className="p-2 rounded-lg hover:bg-[var(--card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[var(--muted)] hover:text-[var(--text)]"
            >
              <RotateCcw className="w-4 h-4" />
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
