"use client";

import { useTicketGeneration } from "@/lib/hooks/useTicketGeneration";
import { useIntegrationActions } from "@/lib/hooks/useIntegrationActions";
import { GenerateWorkspace } from "@/components/generate/GenerateWorkspace";
import { NoAiKeyCard } from "@/components/generate/NoAiKeyCard";

export default function GeneratePage() {
  const gen = useTicketGeneration();
  const integration = useIntegrationActions({
    ticket: gen.ticket,
    uploadCount: gen.uploadCount,
    onError: gen.setError,
  });

  if (gen.hasAiKey === null) return null;

  if (!gen.hasAiKey) return <NoAiKeyCard />;

  return <GenerateWorkspace gen={gen} integration={integration} />;
}
