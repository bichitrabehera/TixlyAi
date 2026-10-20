"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, RotateCcw, Sparkles, Square } from "lucide-react";
import { Slack } from "developer-icons";
import { CgLinear } from "react-icons/cg";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AgentRunTimeline } from "@/components/ai/AgentRunTimeline";
import type { StreamStep } from "@/lib/ai/stream-types";
import { NeedsReviewBanner } from "@/components/ai/GuardrailNotice";
import { parseTicketData, type TicketData } from "@/lib/tickets/format";
import { TICKET_TYPE_META, type TicketType } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { RunUsage } from "@/lib/hooks/useTicketGeneration";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-ink">{children}</h2>;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <p className="text-sm leading-relaxed text-prose">
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className="rounded border border-hairline bg-panel px-1.5 py-0.5 text-sm text-ink"
          >
            {part}
          </code>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex gap-2.5 text-sm leading-relaxed text-prose"
        >
          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-dash" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

interface OutputScreenProps {
  ticket: string;
  loading: boolean;
  status: string;
  steps: StreamStep[];
  needsReview: boolean;
  usage: RunUsage | null;
  dirty: boolean;
  disabled: boolean;
  editing: boolean;
  onEditingChange: (value: boolean) => void;
  onExport: () => void;
  onEditInputs: () => void;
  onReset: () => void;
  onRegenerate: () => void;
  onTicketChange: (value: string) => void;
  onStop: () => void;
  onSendToSlack: () => Promise<void>;
  slackLoading: boolean;
  slackSent: boolean;
  slackConnected: boolean;
  linearConnected: boolean;
  linearLoading: boolean;
  linearSent: boolean;
  onSendToLinear: () => Promise<void>;
}

function BarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-control-border bg-control px-2.5 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function formatPriority(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function environmentLabel(environment: string) {
  if (/prod/i.test(environment)) return "Production";
  return environment.split(/[·\n]/)[0]?.trim() || environment;
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTokens(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function confidenceTone(confidence: number) {
  if (confidence >= 80) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }

  if (confidence >= 50) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }

  return "bg-red-500/10 text-red-700 dark:text-red-400";
}

function MetaStrip({
  ticket,
  usage,
  editing,
  onEdit,
  onRegenerate,
}: {
  ticket: TicketData;
  usage: RunUsage | null;
  editing: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
}) {
  const typeMeta = ticket.type
    ? TICKET_TYPE_META[ticket.type as TicketType]
    : null;
  const env = ticket.environment ? environmentLabel(ticket.environment) : null;
  const confidence =
    typeof ticket.confidence === "number" &&
    ticket.confidence >= 0 &&
    ticket.confidence <= 100
      ? Math.round(ticket.confidence)
      : null;

  const usageParts: string[] = [];
  if (usage?.model) usageParts.push(usage.model);
  if (usage?.latencyMs !== undefined)
    usageParts.push(formatLatency(usage.latencyMs));
  if (usage?.inputTokens !== undefined && usage?.outputTokens !== undefined) {
    usageParts.push(
      `${formatTokens(usage.inputTokens)}→${formatTokens(usage.outputTokens)} tok`,
    );
  }

  return (
    <div className="my-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {typeMeta && (
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ticket.type === "bug" ? "bg-red-600" : "bg-[#9B9992]",
              )}
              aria-hidden
            />
            <span className="font-semibold text-ink">{typeMeta.label}</span>
          </span>
        )}

        {ticket.priority && (
          <span className="text-sm text-muted">
            <span className="font-semibold text-ink">
              {formatPriority(ticket.priority)}
            </span>{" "}
            severity
          </span>
        )}

        {confidence !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
              confidenceTone(confidence),
            )}
            title="Model-reported certainty that this ticket is accurate and complete"
          >
            <span className="size-1.5 rounded-full bg-current opacity-70" />
            {confidence}% confidence
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {usageParts.length > 0 && (
          <span
            className="hidden text-[11px] text-muted sm:block"
            title="Model, latency, and token usage for this run"
          >
            {usageParts.join(" · ")}
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={editing}
            className="cursor-pointer rounded-lg border border-control-border bg-control px-2.5 py-1 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit ticket
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            className="cursor-pointer rounded-lg border border-control-border bg-control px-2.5 py-1 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  );
}

export function OutputScreen({
  ticket: ticketText,
  loading,
  status,
  steps,
  needsReview,
  usage,
  dirty,
  disabled,
  editing,
  onEditingChange,
  onExport,
  onEditInputs,
  onReset,
  onRegenerate,
  onTicketChange,
  onStop,
  onSendToSlack,
  slackLoading,
  slackSent,
  slackConnected,
  linearConnected,
  linearLoading,
  linearSent,
  onSendToLinear,
}: OutputScreenProps) {
  const router = useRouter();
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const ticket = parseTicketData(ticketText);
  const hasTicket = !!ticketText.trim();

  const openIntegrations = () =>
    router.push(`${ROUTES.settings}?section=integrations`);

  const handleRegenerate = () => {
    if (dirty) {
      setConfirmRegenerate(true);
      return;
    }
    onEditingChange(false);
    onRegenerate();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-canvas">
      {loading ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <p className="micro-label text-ink-3">Run progress</p>
            <p
              aria-live="polite"
              className="mt-2 flex items-center gap-2 text-sm text-muted"
            >
              <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-hairline border-t-primary" />
              {status || "Working…"}
            </p>
            <div className="mt-4 rounded-xl border border-hairline bg-panel-soft p-4">
              {steps.length > 0 ? (
                <AgentRunTimeline steps={steps} />
              ) : (
                <p className="text-sm text-muted">Starting…</p>
              )}
            </div>
          </div>
        </div>
      ) : !hasTicket ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-dash bg-panel-soft px-8 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-full border border-hairline bg-control text-ink-3">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">
                Your ticket appears here
              </p>
              <p className="mt-1 text-sm text-muted">
                Add a screenshot, tune the options, then hit Generate.
              </p>
            </div>
          </div>
        </div>
      ) : editing ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-2 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-muted">
                Edit the generated ticket
              </p>
              <button
                type="button"
                onClick={() => onEditingChange(false)}
                className="cursor-pointer rounded-lg border border-control-border bg-control px-2.5 py-1 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
              >
                Done
              </button>
            </div>
            <Textarea
              value={ticketText}
              onChange={(event) => onTicketChange(event.target.value)}
              rows={22}
              className="min-h-[420px] w-full resize-y rounded-lg px-3.5 py-3 text-sm leading-relaxed"
              aria-label="Ticket text"
            />
            <p className="text-[11px] text-ink-3">
              Regenerating will ask for confirmation before overwriting your
              edits.
            </p>
          </div>
        </div>
      ) : !ticket.title && !ticket.description ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <button
              type="button"
              onClick={handleRegenerate}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-control-border bg-control px-2.5 py-1 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Regenerate
            </button>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-hairline bg-panel p-4 text-sm leading-relaxed text-muted">
              {ticketText}
            </pre>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <article className="animate-fade-up mx-auto w-full max-w-4xl px-5 pb-24">
            {" "}
            {needsReview && <NeedsReviewBanner />}
            {dirty && (
              <p className=" text-[10px] uppercase tracking-widest text-ink-3">
                Edited by you
              </p>
            )}
            {ticket.title && (
              <h1 className="text-xl font-semibold tracking-tight text-ink">
                {ticket.title}
              </h1>
            )}
            <MetaStrip
              ticket={ticket}
              usage={usage}
              editing={editing}
              onEdit={() => onEditingChange(true)}
              onRegenerate={handleRegenerate}
            />
            <div className="mt-6 max-w-3xl space-y-6">
              {ticket.description && (
                <section className="space-y-2">
                  <SectionHeading>Executive Summary</SectionHeading>
                  <RichText text={ticket.description} />
                </section>
              )}

              {(ticket.expected || ticket.actual) && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {ticket.expected && (
                    <div className="space-y-1.5 rounded-xl border border-hairline bg-panel-soft p-4">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                          aria-hidden
                        />
                        Expected
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        {ticket.expected}
                      </p>
                    </div>
                  )}

                  {ticket.actual && (
                    <div className="space-y-1.5 rounded-xl border border-hairline bg-panel-soft p-4">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-red-600"
                          aria-hidden
                        />
                        Actual
                      </p>
                      <p className="text-sm leading-relaxed text-muted">
                        {ticket.actual}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(ticket.steps?.length ?? 0) > 0 && (
                <section className="space-y-2">
                  <SectionHeading>Steps to reproduce</SectionHeading>
                  <ol className="divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-control">
                    {(ticket.steps ?? []).map((step, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-prose"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-control-border bg-panel text-[11px] text-muted">
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {ticket.userStory && (
                <section className="space-y-2">
                  <SectionHeading>User story</SectionHeading>
                  <p className="text-sm leading-relaxed text-prose">
                    {ticket.userStory}
                  </p>
                </section>
              )}

              {ticket.scope && (
                <section className="space-y-2">
                  <SectionHeading>Scope</SectionHeading>
                  <p className="text-sm leading-relaxed text-prose">
                    {ticket.scope}
                  </p>
                </section>
              )}

              {ticket.summary && (
                <section className="space-y-2">
                  <SectionHeading>Summary</SectionHeading>
                  <p className="text-sm leading-relaxed text-prose">
                    {ticket.summary}
                  </p>
                </section>
              )}

              {ticket.sentiment && (
                <section className="space-y-2">
                  <SectionHeading>Sentiment</SectionHeading>
                  <p className="text-sm leading-relaxed text-prose">
                    {ticket.sentiment}
                  </p>
                </section>
              )}

              {ticket.location && (
                <section className="space-y-2">
                  <SectionHeading>Location</SectionHeading>
                  <p className="text-sm leading-relaxed text-prose">
                    {ticket.location}
                  </p>
                </section>
              )}

              {(ticket.acceptanceCriteria?.length ?? 0) > 0 && (
                <section className="space-y-2">
                  <SectionHeading>Acceptance criteria</SectionHeading>
                  <BulletList items={ticket.acceptanceCriteria ?? []} />
                </section>
              )}

              {(ticket.checklist?.length ?? 0) > 0 && (
                <section className="space-y-2">
                  <SectionHeading>Checklist</SectionHeading>
                  <BulletList items={ticket.checklist ?? []} />
                </section>
              )}

              {(ticket.actionItems?.length ?? 0) > 0 && (
                <section className="space-y-2">
                  <SectionHeading>Action items</SectionHeading>
                  <BulletList items={ticket.actionItems ?? []} />
                </section>
              )}

              {(ticket.environment || ticket.additionalNotes) && (
                <section className="space-y-3 rounded-xl border border-dashed border-dash bg-panel-soft p-4">
                  {ticket.environment && (
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-ink">
                        Environment
                      </p>
                      <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-ink">
                        {ticket.environment}
                      </p>
                    </div>
                  )}

                  {ticket.additionalNotes && (
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-ink">Notes</p>
                      <p className="text-sm leading-relaxed text-muted">
                        {ticket.additionalNotes}
                      </p>
                    </div>
                  )}
                </section>
              )}
            </div>
            <div className="mt-6 flex shrink-0 flex-wrap items-center gap-1.5">
              {loading ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-control-border bg-control px-2.5 text-sm font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink"
                >
                  <Square className="size-3 fill-current" aria-hidden />
                  Stop
                </button>
              ) : (
                hasTicket && (
                  <>
                    <BarButton
                      label="Download"
                      onClick={onExport}
                      disabled={disabled}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                    </BarButton>

                    {slackConnected ? (
                      <BarButton
                        label={slackSent ? "Sent to Slack" : "Send to Slack"}
                        onClick={onSendToSlack}
                        disabled={disabled || slackLoading || slackSent}
                      >
                        {slackSent ? (
                          <Check
                            className="h-3.5 w-3.5 text-primary"
                            aria-hidden
                          />
                        ) : (
                          <Slack className="h-3.5 w-3.5" />
                        )}
                      </BarButton>
                    ) : (
                      <BarButton
                        label="Connect Slack"
                        onClick={openIntegrations}
                      >
                        <Slack className="h-3.5 w-3.5" />
                      </BarButton>
                    )}

                    {linearConnected ? (
                      <BarButton
                        label={
                          linearSent ? "Pushed to Linear" : "Push to Linear"
                        }
                        onClick={onSendToLinear}
                        disabled={disabled || linearLoading || linearSent}
                      >
                        {linearSent ? (
                          <Check
                            className="h-3.5 w-3.5 text-primary"
                            aria-hidden
                          />
                        ) : (
                          <CgLinear className="h-3.5 w-3.5" />
                        )}
                      </BarButton>
                    ) : (
                      <BarButton
                        label="Connect Linear"
                        onClick={openIntegrations}
                      >
                        <CgLinear className="h-3.5 w-3.5" />
                      </BarButton>
                    )}
                  </>
                )
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-7 gap-1.5 text-sm text-muted hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                New ticket
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditInputs}
                className="h-7 gap-1.5 text-sm text-muted hover:text-ink lg:hidden"
              >
                Edit inputs
              </Button>
            </div>
          </article>
        </div>
      )}

      <ConfirmRegenerateDialog
        open={confirmRegenerate}
        onOpenChange={setConfirmRegenerate}
        onConfirm={() => {
          setConfirmRegenerate(false);
          onEditingChange(false);
          onRegenerate();
        }}
      />
    </div>
  );
}

function ConfirmRegenerateDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Regenerate ticket?</DialogTitle>
          <DialogDescription>
            You have edits that will be overwritten by a freshly generated
            ticket. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Keep my edits
          </Button>
          <Button type="button" size="sm" onClick={onConfirm}>
            <RotateCcw aria-hidden />
            Regenerate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
