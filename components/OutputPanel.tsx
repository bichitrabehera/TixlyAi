"use client";

import { Slack } from "developer-icons";
import { RotateCcw, Copy, Check, Loader2, ImagePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  loading?: boolean;
  status?: string;
  ocrFailed?: boolean;
  manualOcrText?: string;
  onManualOcrChange?: (value: string) => void;
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
  loading = false,
  status = "",
  ocrFailed = false,
  manualOcrText = "",
  onManualOcrChange,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), TOAST_DISMISS_MS);
  };

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 pt-10 pb-20">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
          <p className="text-sm text-foreground">
            {status || "Generating ticket…"}
          </p>
        </div>
      )}

      {!loading && ticket && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card px-6 py-5">
            <TicketCard ticketText={ticket} />
          </div>

          <div className="flex items-center gap-2 px-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={disabled}
              title="Copy ticket"
              className="h-8 w-8 border border-border p-2 rounded-full hover:bg-card"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            <div className="flex justify-center items-center gap-3">
              {(slackConnected || linearConnected) && (
                <span className="ml-2 text-sm text-muted-foreground">
                  Send to
                </span>
              )}

              {slackConnected && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSendToSlack}
                  disabled={disabled || slackLoading || slackSent}
                  title="Send to Slack"
                  className="h-8 w-8 border border-border p-2 rounded-full hover:bg-card"
                >
                  {slackLoading ? (
                    <span className="block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
                  ) : slackSent ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Slack className="h-4 w-4" />
                  )}
                </Button>
              )}

              {linearConnected && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSendToLinear}
                  disabled={disabled || linearLoading || linearSent}
                  title="Create in Linear"
                  className="h-8 w-8 border border-border p-2 rounded-full hover:bg-card"
                >
                  {linearLoading ? (
                    <span className="block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-transparent" />
                  ) : linearSent ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <CgLinear className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              disabled={disabled}
              title="New ticket"
              className="h-8 w-8 text-muted-foreground hover:bg-card hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {!loading && !ticket && !ocrFailed && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card mb-20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: 0.5,
            }}
          />
          <div className="relative bg-card px-8 py-24 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
              <ImagePlus className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              Upload a screenshot to generate a ticket
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste, drag &amp; drop, or browse for an image on the left
            </p>
          </div>
        </div>
      )}

      {!loading && ocrFailed && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-foreground">
            Screenshot upload failed
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Paste the on-screen text below and generate again, or replace the
            screenshot.
          </p>
          <Textarea
            value={manualOcrText}
            onChange={(e) => onManualOcrChange?.(e.target.value)}
            rows={4}
            placeholder="Paste the text from the screenshot here…"
            className="mt-3 min-h-0 resize-none rounded-xl bg-background shadow-none"
          />
        </div>
      )}
    </div>
  );
}
