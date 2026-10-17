"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputScreen } from "@/components/generate/InputScreen";
import { OutputScreen } from "@/components/generate/OutputScreen";
import { GuardrailNotice } from "@/components/ai/GuardrailNotice";
import { useTicketGeneration } from "@/lib/hooks/useTicketGeneration";
import { useIntegrationActions } from "@/lib/hooks/useIntegrationActions";
import { cn } from "@/lib/utils";

interface GenerateWorkspaceProps {
  gen: ReturnType<typeof useTicketGeneration>;
  integration: ReturnType<typeof useIntegrationActions>;
}

export function GenerateWorkspace({ gen, integration }: GenerateWorkspaceProps) {
  const showInput = gen.screen === "input";
  const showOutput = gen.screen === "output" || gen.loading;
  const hasStrip = Boolean(gen.error || gen.guardrailNotice);

  return (
    <div className="-mx-4 flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden md:-mx-6">
      <div
        className={cn(
          "h-full min-h-0 w-full shrink-0 lg:w-[440px] lg:border-r lg:border-border",
          showInput ? "block" : "hidden lg:block",
        )}
      >
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
          fileInputRef={gen.fileInputRef}
          onNoteChange={gen.setNote}
          onTicketTypeChange={gen.handleTicketTypeChange}
          onPreferredPriorityChange={gen.setPreferredPriority}
          onPrefsChange={gen.handlePrefsChange}
          onManualOcrChange={gen.setManualOcrText}
          onDrop={gen.handleDrop}
          onDragOver={gen.handleDragOver}
          onFileChange={gen.handleFileChange}
          onRemoveImage={gen.removeImage}
          onGenerate={gen.generateTicket}
          onStop={gen.stopGeneration}
        />
      </div>

      <div
        className={cn(
          "h-full min-h-0 flex-1",
          showOutput ? "flex flex-col" : "hidden lg:flex lg:flex-col",
        )}
      >
        {hasStrip && (
          <div className="shrink-0 space-y-2 border-b border-border bg-background px-6 py-2.5">
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
            dirty={gen.ticketDirty}
            disabled={!gen.ticket || gen.loading}
            onCopy={gen.copyToClipboard}
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
            onSendToLinear={integration.sendToLinear}
            linearLoading={integration.linearLoading}
            linearSent={integration.linearSent}
            linearConnected={integration.linearConnected}
          />
        </div>
      </div>
    </div>
  );
}
