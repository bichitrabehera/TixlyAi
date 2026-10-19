import { AIMessage } from "@langchain/core/messages";
import { decrypt } from "@/lib/crypto";
import { PROVIDER_LABELS, type AiProvider } from "@/lib/constants";
import type { TicketRequest } from "@/lib/tickets/schemas";
import { AI_MODEL_CONFIG, RUN_STEPS, modelVisionHeuristic, AGENT_LIMITS } from "./config";
import { createTicketAgent } from "./agent";
import { buildUserText } from "./prompts";
import { GuardrailViolationError } from "./middleware";
import {
  NoStructuredOutputError,
  RUN_FAILED_MESSAGE,
  isAuthModelError,
} from "./errors";
import type { RunStreamEvent, StreamStep } from "./stream-types";

export interface StreamRunOptions {
  provider: AiProvider;
  encryptedKey: string;
  req: TicketRequest;
  userId: string;
}

interface DriveResult {
  structured: unknown;
  guardrailHits: string[];
  usage?: { inputTokens?: number; outputTokens?: number };
}

type AgentStateSnapshot = {
  messages?: unknown[];
  structuredResponse?: unknown;
  guardrailHits?: string[];
};

function buildHumanContent(
  req: TicketRequest,
  includeImage: boolean,
): Array<
  { type: "image_url"; image_url: { url: string } } | { type: "text"; text: string }
> {
  const blocks: Array<
    { type: "image_url"; image_url: { url: string } } | { type: "text"; text: string }
  > = [];

  if (includeImage) {
    const url = req.screenshotUrl || req.imageDataUri;
    if (url) blocks.push({ type: "image_url", image_url: { url } });
  }

  blocks.push({ type: "text", text: buildUserText(req) });
  return blocks;
}

function messageText(message: unknown): string {
  if (!(message instanceof AIMessage)) return "";
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) {
    return message.content
      .map((b) =>
        b && typeof b === "object" && "text" in b
          ? String((b as { text: unknown }).text ?? "")
          : "",
      )
      .join("");
  }
  return "";
}

function messageToolCalls(message: unknown): string[] {
  if (!(message instanceof AIMessage)) return [];
  if (!Array.isArray(message.tool_calls)) return [];
  return message.tool_calls.map((c) => String(c.name ?? "tool"));
}

/**
 * Drives one agent run (with image or text-only), yielding step events as
 * state snapshots arrive. Returns the final structured response.
 */
async function* driveRun(
  opts: StreamRunOptions,
  apiKey: string,
  includeImage: boolean,
): AsyncGenerator<RunStreamEvent, DriveResult> {
  const agent = createTicketAgent({
    provider: opts.provider,
    apiKey,
    req: opts.req,
    userId: opts.userId,
  });

  const stream = await agent.stream(
    {
      messages: [
        { role: "user", content: buildHumanContent(opts.req, includeImage) },
      ],
    },
    { streamMode: "values", recursionLimit: AGENT_LIMITS.graphRecursionLimit },
  );

  let structured: unknown;
  let guardrailHits: string[] = [];
  let toolsActive = false;
  let analyzed = false;
  let drafting = false;
  let toolsDone = false;
  const finalMessages: unknown[] = [];

  for await (const raw of stream) {
    const snapshot = raw as AgentStateSnapshot;

    if (snapshot.structuredResponse) structured = snapshot.structuredResponse;
    if (snapshot.guardrailHits?.length) guardrailHits = snapshot.guardrailHits;

    const messages = snapshot.messages ?? [];
    if (messages.length > 0) {
      finalMessages.splice(0, finalMessages.length, ...messages);
    }

    const last = messages[messages.length - 1];
    const toolCalls = messageToolCalls(last);
    const text = messageText(last);

    if (toolCalls.length > 0) {
      if (!analyzed) {
        analyzed = true;
        yield { type: "step", step: { ...RUN_STEPS.analyze, status: "done" } };
      }
      if (!toolsActive && !toolsDone) {
        toolsActive = true;
        yield { type: "step", step: { ...RUN_STEPS.tools, status: "running" } };
      }
      if (!drafting) {
        drafting = true;
        yield { type: "step", step: { ...RUN_STEPS.draft, status: "running" } };
      }
    } else if (text.trim().length > 0) {
      if (toolsActive) {
        toolsActive = false;
        toolsDone = true;
        yield { type: "step", step: { ...RUN_STEPS.tools, status: "done" } };
      }
      if (!analyzed) {
        analyzed = true;
        yield { type: "step", step: { ...RUN_STEPS.analyze, status: "done" } };
      }
      if (!drafting) {
        drafting = true;
        yield { type: "step", step: { ...RUN_STEPS.draft, status: "running" } };
      }
    }
  }

  if (!structured) {
    throw new NoStructuredOutputError();
  }

  if (toolsActive) {
    yield { type: "step", step: { ...RUN_STEPS.tools, status: "done" } };
  }
  if (!analyzed) {
    yield { type: "step", step: { ...RUN_STEPS.analyze, status: "done" } };
  }
  if (drafting) {
    yield { type: "step", step: { ...RUN_STEPS.draft, status: "done" } };
  }

  let usage: DriveResult["usage"];
  for (let i = finalMessages.length - 1; i >= 0; i--) {
    const m = finalMessages[i];
    if (m instanceof AIMessage && m.usage_metadata) {
      usage = {
        inputTokens: m.usage_metadata.input_tokens,
        outputTokens: m.usage_metadata.output_tokens,
      };
      break;
    }
  }

  return { structured, guardrailHits, usage };
}

/**
 * Streaming entrypoint for ticket generation.
 *
 * Yields RunStreamEvent frames (NDJSON-friendly): step updates, guardrail
 * notices, a final `done` carrying the structured ticket, or `error`.
 */
export async function* streamTicketRun(
  opts: StreamRunOptions,
): AsyncGenerator<RunStreamEvent> {
  const startedAt = Date.now();
  const steps: StreamStep[] = [
    { ...RUN_STEPS.validate, status: "pending" },
    { ...RUN_STEPS.analyze, status: "pending" },
    { ...RUN_STEPS.tools, status: "pending" },
    { ...RUN_STEPS.draft, status: "pending" },
    { ...RUN_STEPS.validateOutput, status: "pending" },
  ];

  const record = (event: RunStreamEvent): RunStreamEvent => {
    if (event.type === "step") {
      const existing = steps.find((s) => s.id === event.step.id);
      if (existing) {
        existing.status = event.step.status;
        existing.label = event.step.label;
      } else {
        steps.push({ ...event.step });
      }
    }
    return event;
  };

  /**
   * Whitelisted error events: guardrail messages are authored by us and safe
   * to show, auth failures get a friendly key message (and mark the run so
   * the route can invalidate the stored key), and everything else collapses
   * to a fixed message — raw provider/DB error text never reaches the client.
   */
  const failEvent = (err: unknown): RunStreamEvent => {
    if (err instanceof GuardrailViolationError) {
      return { type: "error", message: err.message, code: err.code };
    }
    if (isAuthModelError(err)) {
      return {
        type: "error",
        message: `Your ${PROVIDER_LABELS[opts.provider]} key was rejected. Replace it in API keys and try again.`,
        code: "key_invalid",
      };
    }
    return { type: "error", message: RUN_FAILED_MESSAGE, code: "run_failed" };
  };

  const req = opts.req;
  const hasImage = Boolean(req.screenshotUrl || req.imageDataUri);
  const hasText = Boolean(req.ocrText?.trim() || req.note?.trim());
  // The model is fixed per provider, so vision support is derived from the
  // configured model — never from client input.
  const modelName = AI_MODEL_CONFIG[opts.provider].model;
  const visionOk = modelVisionHeuristic(opts.provider, modelName);
  const includeImage = hasImage && visionOk;

  let apiKey: string;
  try {
    apiKey = decrypt(opts.encryptedKey);
  } catch {
    yield {
      type: "error",
      message: "Could not decrypt your API key. Re-add it in Settings.",
      code: "key_decryption_failed",
    };
    return;
  }

  yield record({ type: "step", step: { ...RUN_STEPS.validate, status: "running" } });

  if (!includeImage && !hasText) {
    yield record({
      type: "error",
      message: hasImage
        ? "This model can't read images. Paste the text from the screenshot as context."
        : "Provide a screenshot or text.",
      code: hasImage ? "model_no_image" : "empty_input",
    });
    return;
  }

  yield record({ type: "step", step: { ...RUN_STEPS.validate, status: "done" } });
  yield record({ type: "step", step: { ...RUN_STEPS.analyze, status: "running" } });

  let result: DriveResult | null = null;

  try {
    const generator = driveRun(opts, apiKey, includeImage);
    let next = await generator.next();
    while (!next.done) {
      yield record(next.value);
      next = await generator.next();
    }
    result = next.value;
  } catch (err) {
    const isGuardrail = err instanceof GuardrailViolationError;
    const isNoOutput = err instanceof NoStructuredOutputError;
    const isAuth = isAuthModelError(err);
    // Fallback exists to recover from vision failures — never to buy a fresh
    // model-call budget after the cost cap, retry auth failures, or re-attempt
    // a run that already failed schema validation.
    const canFallback =
      includeImage && hasText && !isGuardrail && !isNoOutput && !isAuth;

    if (!canFallback) {
      yield record(failEvent(err));
      return;
    }

    yield record({ type: "step", step: { ...RUN_STEPS.analyze, status: "error" } });
    yield record({
      type: "guardrail",
      level: "warn",
      message: "Image analysis failed — retrying with your OCR text / note only.",
    });
    yield record({ type: "step", step: { ...RUN_STEPS.fallback, status: "running" } });

    try {
      const generator = driveRun(opts, apiKey, false);
      let next = await generator.next();
      while (!next.done) {
        yield record(next.value);
        next = await generator.next();
      }
      result = next.value;
      yield record({ type: "step", step: { ...RUN_STEPS.fallback, status: "done" } });
    } catch (retryErr) {
      yield record(failEvent(retryErr));
      return;
    }
  }

  if (!result) {
    yield record({
      type: "error",
      message: "No ticket was produced. Try again.",
      code: "no_output",
    });
    return;
  }

  const structured = result.structured as { needsHumanReview?: boolean };
  // A guardrail hit always forces review server-side — never trust the model
  // to set the flag when the whole point of the hit is that instructions were
  // contestable.
  const guardrailHit = result.guardrailHits.length > 0;
  const needsReview = Boolean(structured.needsHumanReview) || guardrailHit;

  yield record({ type: "step", step: { ...RUN_STEPS.validateOutput, status: "running" } });
  yield record({ type: "step", step: { ...RUN_STEPS.validateOutput, status: "done" } });

  if (guardrailHit) {
    yield {
      type: "guardrail",
      level: "warn",
      message:
        "Suspicious instructions were detected in your text. Review the ticket carefully before using it — it has been flagged for human review.",
    };
  }

  yield {
    type: "done",
    ticket: JSON.stringify({ ...structured, needsHumanReview: needsReview }),
    needsReview,
    steps,
    usage: {
      ...result.usage,
      model: modelName,
      latencyMs: Date.now() - startedAt,
    },
  };
}
