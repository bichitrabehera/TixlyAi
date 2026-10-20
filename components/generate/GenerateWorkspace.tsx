"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Pencil } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputScreen } from "@/components/generate/InputScreen";
import { OutputScreen } from "@/components/generate/OutputScreen";
import { GuardrailNotice } from "@/components/ai/GuardrailNotice";
import { useTicketGeneration } from "@/lib/hooks/useTicketGeneration";
import { useIntegrationActions } from "@/lib/hooks/useIntegrationActions";
import { useTopBarSlot } from "@/components/dashboard/TopBarSlot";
import { TOAST_DISMISS_MS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GenerateWorkspaceProps {
  gen: ReturnType<typeof useTicketGeneration>;
  integration: ReturnType<typeof useIntegrationActions>;
}

function TopBarButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-control-border bg-control px-2.5 py-1 text-xs font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
      {label}
    </button>
  );
}

export function GenerateWorkspace({
  gen,
  integration,
}: GenerateWorkspaceProps) {
  const showInput = gen.screen === "input";
  const showOutput = gen.screen === "output" || gen.loading;
  const hasStrip = Boolean(gen.error || gen.guardrailNotice);
  const { slot } = useTopBarSlot();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasTicket = !!gen.ticket.trim();

  const handleCopy = async () => {
    await gen.copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), TOAST_DISMISS_MS);
  };

  const topBarActions = slot
    ? createPortal(
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="hidden max-w-[220px] items-center gap-1.5 text-[11px] text-muted sm:flex">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                gen.loading ? "animate-pulse bg-brand" : "bg-primary",
              )}
              aria-hidden
            />
            <span className="truncate">
              {gen.loading ? gen.status || "Working…" : "Ready"}
            </span>
          </span>

          <span
            className="hidden h-3.5 w-[1px] bg-hairline sm:block"
            aria-hidden
          />

          <TopBarButton
            label={copied ? "Copied" : "Copy MD"}
            onClick={handleCopy}
            disabled={!hasTicket || gen.loading}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
          </TopBarButton>

          <TopBarButton
            label="Edit"
            onClick={() => setEditing((value) => !value)}
            disabled={!hasTicket || gen.loading}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </TopBarButton>
        </div>,
        slot,
      )
    : null;

  return (
    <>
      {topBarActions}
      <div className="-mx-4 -my-4 flex min-h-0 flex-col overflow-y-auto overflow-x-hidden lg:h-[calc(100dvh-4rem)] lg:flex-row lg:overflow-hidden">
        {" "}
        <div className="w-full shrink-0 bg-canvas/60 lg:h-full lg:w-[530px] lg:overflow-y-auto">
          <InputScreen
            image={gen.image}
            fileName={gen.fileName}
            note={gen.note}
            loading={gen.loading}
            ocrFailed={gen.ocrFailed}
            manualOcrText={gen.manualOcrText}
            fileError={gen.fileError}
            dragging={gen.dragging}
            ticketType={gen.ticketType}
            preferredPriority={gen.preferredPriority}
            prefsValue={gen.prefsValue}
            aiProvider={gen.aiProvider}
            model={gen.model}
            fileInputRef={gen.fileInputRef}
            onNoteChange={gen.setNote}
            onTicketTypeChange={gen.handleTicketTypeChange}
            onPreferredPriorityChange={gen.setPreferredPriority}
            onPrefsChange={gen.handlePrefsChange}
            onModelChange={gen.setModel}
            onManualOcrChange={gen.setManualOcrText}
            onDrop={gen.handleDrop}
            onDragOver={gen.handleDragOver}
            onFileChange={gen.handleFileChange}
            onRemoveImage={gen.removeImage}
            onGenerate={gen.generateTicket}
            onStop={gen.stopGeneration}
          />
        </div>
        <div className="flex min-h-[500px] w-full shrink-0 flex-col overflow-hidden bg-canvas lg:h-full lg:min-w-0 lg:flex-1">
          {hasStrip && (
            <div className="shrink-0 space-y-2 border-b border-hairline bg-canvas px-6 py-2.5">
              {gen.error && (
                <Alert role="alert" variant="destructive">
                  <AlertDescription>{gen.error}</AlertDescription>
                </Alert>
              )}
              {gen.guardrailNotice && (
                <GuardrailNotice level="warn" message={gen.guardrailNotice} />
              )}
            </div>
          )}

          <div className="min-h-0 flex-1">
            <OutputScreen
              ticket={gen.ticket}
              loading={gen.loading}
              status={gen.status}
              steps={gen.steps}
              needsReview={gen.needsReview}
              usage={gen.usage}
              dirty={gen.ticketDirty}
              disabled={!gen.ticket || gen.loading}
              editing={editing}
              onEditingChange={setEditing}
              onExport={gen.exportTicket}
              onEditInputs={gen.showInput}
              onReset={gen.reset}
              onRegenerate={gen.generateTicket}
              onTicketChange={gen.markTicketEdited}
              onStop={gen.stopGeneration}
              onSendToSlack={integration.sendToSlack}
              slackLoading={integration.slackLoading}
              slackSent={integration.slackSent}
              slackConnected={integration.slackConnected}
              linearConnected={integration.linearConnected}
              linearLoading={integration.linearLoading}
              linearSent={integration.linearSent}
              onSendToLinear={integration.sendToLinear}
            />
          </div>
        </div>
      </div>
    </>
  );
}
