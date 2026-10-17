"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bug,
  Check,
  CheckCircle2,
  CheckSquare,
  Circle,
  Copy,
  Download,
  Layers,
  MessageSquare,
  Pencil,
  RotateCcw,
  Sparkles,
  Square,
  Terminal,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AgentRunTimeline } from "@/components/ai/AgentRunTimeline";
import type { StreamStep } from "@/lib/ai/stream-types";
import { NeedsReviewBanner } from "@/components/ai/GuardrailNotice";
import { useSettingsDialog } from "@/components/settings/SettingsDialogProvider";
import {
  parseTicketData,
  ticketDisplayId,
  type TicketData,
} from "@/lib/tickets/format";
import {
  TICKET_TYPE_META,
  TOAST_DISMISS_MS,
  type TicketType,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  bug: <Bug className="h-3.5 w-3.5" aria-hidden />,
  feature: <Sparkles className="h-3.5 w-3.5" aria-hidden />,
  ui: <Layers className="h-3.5 w-3.5" aria-hidden />,
  feedback: <MessageSquare className="h-3.5 w-3.5" aria-hidden />,
  task: <CheckSquare className="h-3.5 w-3.5" aria-hidden />,
};

const priorityTone: Record<string, string> = {
  CRITICAL: "border-destructive/25 bg-destructive/5 text-destructive",
  HIGH: "border-destructive/20 bg-destructive/5 text-destructive",
  MEDIUM:
    "border-amber-500/25 bg-amber-500/5 text-amber-600 dark:text-amber-400",
  LOW: "border-border bg-secondary text-muted-foreground",
};

function PropertyPill({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase text-muted-foreground/70">
      {children}
    </h2>
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <p className="text-sm leading-6 text-foreground/90">
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className="rounded border border-border/70 bg-secondary px-1.5 py-0.5 font-mono text-xs text-foreground/80"
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
          className="flex gap-2.5 text-sm leading-6 text-foreground/90"
        >
          <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
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
  dirty: boolean;
  disabled: boolean;
  onCopy: () => void;
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
  onSendToLinear: () => Promise<void>;
  linearLoading: boolean;
  linearSent: boolean;
  linearConnected: boolean;
}

function BarButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        active && "border-primary/40 bg-primary/10 text-primary",
      )}
    >
      {children}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

function MetaStrip({ ticket }: { ticket: TicketData }) {
  const typeMeta = ticket.type
    ? TICKET_TYPE_META[ticket.type as TicketType]
    : null;
  const priority = ticket.priority?.toUpperCase();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {priority && (
        <PropertyPill className={priorityTone[priority] || priorityTone.LOW}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {ticket.priority}
        </PropertyPill>
      )}

      {typeMeta && (
        <PropertyPill className="border-border bg-secondary text-foreground/80">
          {ticket.type ? TYPE_ICONS[ticket.type] : null}
          {typeMeta.label}
        </PropertyPill>
      )}

      {ticket.component && (
        <PropertyPill className="border-border bg-secondary text-foreground/70">
          <Terminal className="h-3 w-3" aria-hidden />
          {ticket.component}
        </PropertyPill>
      )}
    </div>
  );
}

export function OutputScreen({
  ticket: ticketText,
  loading,
  status,
  steps,
  needsReview,
  dirty,
  disabled,
  onCopy,
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
  onSendToLinear,
  linearLoading,
  linearSent,
  linearConnected,
}: OutputScreenProps) {
  const { openSettings } = useSettingsDialog();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const ticket = parseTicketData(ticketText);
  const hasTicket = !!ticketText.trim();

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), TOAST_DISMISS_MS);
  };

  const handleRegenerate = () => {
    if (dirty) {
      setConfirmRegenerate(true);
      return;
    }
    setEditing(false);
    onRegenerate();
  };

  const crumb =
    ticket.component ||
    (ticket.type ? TICKET_TYPE_META[ticket.type as TicketType]?.label : "") ||
    "Preview";

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {loading ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-12 py-8">
            <p className="micro-label text-muted-foreground">Run progress</p>
            <p
              aria-live="polite"
              className="mt-2 flex items-center gap-2 text-sm text-foreground/80"
            >
              <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              {status || "Working…"}
            </p>
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              {steps.length > 0 ? (
                <AgentRunTimeline steps={steps} />
              ) : (
                <p className="text-sm text-muted-foreground">Starting…</p>
              )}
            </div>
          </div>
        </div>
      ) : !hasTicket ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-8 py-10 text-center">
            <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                Your ticket appears here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add a screenshot, tune the options, then hit Generate.
              </p>
            </div>
          </div>
        </div>
      ) : editing ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl space-y-2 px-12 py-8">
            <p className="text-xs font-medium text-muted-foreground">
              Edit the generated ticket
            </p>
            <Textarea
              value={ticketText}
              onChange={(event) => onTicketChange(event.target.value)}
              rows={22}
              className="min-h-[420px] w-full resize-y rounded-lg bg-card px-3.5 py-3 font-mono text-xs leading-relaxed"
              aria-label="Ticket text"
            />
            <p className="text-[11px] text-muted-foreground">
              Regenerating will ask for confirmation before overwriting your
              edits.
            </p>
          </div>
        </div>
      ) : !ticket.title && !ticket.description ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-12 py-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              className="h-7 gap-1.5 rounded-md text-xs"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              Regenerate
            </Button>
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-card p-4 text-sm text-foreground/70">
              {ticketText}
            </pre>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <article className="animate-fade-up mx-auto w-full max-w-4xl space-y-6 px-12 py-8">
            {needsReview && <NeedsReviewBanner />}
            {dirty && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Edited by you
              </p>
            )}

            {ticket.title && (
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {ticket.title}
              </h1>
            )}

            <MetaStrip ticket={ticket} />

            {ticket.description && (
              <section className="space-y-2">
                <RichText text={ticket.description} />
              </section>
            )}

            {(ticket.expected || ticket.actual) && (
              <div className="grid grid-cols-1 gap-3">
                {ticket.expected && (
                  <div className="">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                      Expected
                    </p>
                    <p className="mt-1.5 text-sm leading-5 text-foreground/85">
                      {ticket.expected}
                    </p>
                  </div>
                )}

                {ticket.actual && (
                  <div className="">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                      Actual
                    </p>
                    <p className="mt-1.5 text-sm leading-5 text-foreground/85">
                      {ticket.actual}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(ticket.steps?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <SectionHeading>Steps to reproduce</SectionHeading>
                <ol className="space-y-2">
                  {(ticket.steps ?? []).map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[11px] text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="pt-px text-sm leading-5 text-foreground/90">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {ticket.userStory && (
              <section className="space-y-2">
                <SectionHeading>User story</SectionHeading>
                <p className="text-sm leading-6 text-foreground/90">
                  {ticket.userStory}
                </p>
              </section>
            )}

            {ticket.scope && (
              <section className="space-y-2">
                <SectionHeading>Scope</SectionHeading>
                <p className="text-sm leading-6 text-foreground/90">
                  {ticket.scope}
                </p>
              </section>
            )}

            {ticket.summary && (
              <section className="space-y-2">
                <SectionHeading>Summary</SectionHeading>
                <p className="text-sm leading-6 text-foreground/90">
                  {ticket.summary}
                </p>
              </section>
            )}

            {ticket.sentiment && (
              <section className="space-y-2">
                <SectionHeading>Sentiment</SectionHeading>
                <p className="text-sm leading-6 text-foreground/90">
                  {ticket.sentiment}
                </p>
              </section>
            )}

            {ticket.location && (
              <section className="space-y-2">
                <SectionHeading>Location</SectionHeading>
                <p className="text-sm leading-6 text-foreground/90">
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
              <section className="space-y-3">
                {ticket.environment && (
                  <div className="space-y-2">
                    <SectionHeading>Environment</SectionHeading>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                      {ticket.environment}
                    </div>
                  </div>
                )}

                {ticket.additionalNotes && (
                  <div className="space-y-2">
                    <SectionHeading>Notes</SectionHeading>
                    <div className="text-sm text-muted-foreground">
                      {ticket.additionalNotes}
                    </div>
                  </div>
                )}
              </section>
            )}

            <div className="flex shrink-0 items-center gap-1">
              {loading ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onStop}
                  className="h-7 gap-1.5 rounded-md px-2.5 text-xs"
                >
                  <Square className="size-3 fill-current" aria-hidden />
                  Stop
                </Button>
              ) : (
                hasTicket && (
                  <>
                    <BarButton
                      label="Copy MD"
                      onClick={handleCopy}
                      disabled={disabled}
                    >
                      {copied ? (
                        <Check
                          className="h-3.5 w-3.5 text-primary"
                          aria-hidden
                        />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </BarButton>

                    <BarButton
                      label="Download"
                      onClick={onExport}
                      disabled={disabled}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                    </BarButton>

                    <BarButton
                      label={editing ? "Done" : "Edit"}
                      onClick={() => setEditing((value) => !value)}
                      disabled={disabled}
                      active={editing}
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </BarButton>

                    {slackConnected && (
                      <BarButton
                        label="Slack"
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
                    )}

                    {linearConnected && (
                      <BarButton
                        label="Linear"
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
                className="h-7 gap-1.5 text-xs text-muted-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                New ticket
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditInputs}
                className="h-7 gap-1.5 text-xs text-muted-foreground lg:hidden"
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
          setEditing(false);
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
