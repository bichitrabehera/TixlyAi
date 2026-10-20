import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { appendFileSync } from "node:fs";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getOrCreateUser, getAiKey, listAiKeys, setAiKeyStatus } from "@/lib/db/users";
import { deleteAllTicketsForUser } from "@/lib/db/tickets";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  AI_PROVIDERS,
  TICKET_HISTORY_PAGE_SIZE,
  type AiProvider,
} from "@/lib/constants";
import { eq, sql } from "drizzle-orm";
import { TicketRequestSchema, type TicketRequest } from "@/lib/tickets/schemas";
import { flagForHumanReview } from "@/lib/tickets/humanInLoop";
import { streamTicketRun, type RunStreamEvent } from "@/lib/ai";
import { RUN_FAILED_MESSAGE, isAuthModelError } from "@/lib/ai/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId, "");

    const userTickets = await db
      .select()
      .from(tickets)
      .where(eq(tickets.userId, user.clerkUserId))
      .orderBy(sql`${tickets.createdAt} DESC`)
      .limit(TICKET_HISTORY_PAGE_SIZE);

    return NextResponse.json({
      tickets: userTickets,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await deleteAllTicketsForUser(userId);
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("Error deleting tickets:", error);
    return NextResponse.json(
      { error: "Failed to delete tickets" },
      { status: 500 },
    );
  }
}

function extractTicketType(ticketJson: string, fallback?: string): string | null {
  try {
    const parsed = JSON.parse(ticketJson) as { type?: string };
    return parsed.type || fallback || null;
  } catch {
    return fallback || null;
  }
}

// TEMP DIAGNOSTIC — remove after the save bug is confirmed fixed.
const DIAG_LOG = ".ticket-save.log";
function diag(message: string, data?: unknown) {
  try {
    appendFileSync(
      DIAG_LOG,
      `${new Date().toISOString()} ${message}${
        data !== undefined ? " " + JSON.stringify(data) : ""
      }\n`,
    );
  } catch {
    /* logging must never break the request */
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  diag("POST start", { userId });

  let req!: TicketRequest;
  try {
    const body = await request.json();
    req = TicketRequestSchema.parse(body);
  } catch (err) {
    console.error("Invalid request body:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const rateCheck = checkRateLimit(`generate:${userId}`);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateCheck.resetIn / 1000)) },
      },
    );
  }

  const providerLabels: Record<AiProvider, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    openrouter: "OpenRouter",
    google: "Google",
  };

  const keyRows = await listAiKeys(userId);
  const wanted = req.provider && AI_PROVIDERS.includes(req.provider) ? req.provider : null;
  const selectedRow =
    (wanted ? keyRows.find((row) => row.provider === wanted) : undefined) ??
    keyRows[0] ??
    null;

  let provider: AiProvider;
  let encryptedKey: string;

  if (selectedRow) {
    provider = selectedRow.provider as AiProvider;
    encryptedKey = selectedRow.encryptedKey;
    if (selectedRow.status === "invalid") {
      return NextResponse.json(
        {
          error: `Your ${providerLabels[provider]} key was rejected. Replace it in API keys and try again.`,
          code: "key_invalid",
        },
        { status: 400 },
      );
    }
  } else {
    const legacy = await getAiKey(userId);
    if (!legacy) {
      return NextResponse.json(
        {
          error: wanted
            ? `No API key for ${providerLabels[wanted]}. Add one in API keys.`
            : "No AI API key configured. Add one in Settings.",
          code: "no_key",
        },
        { status: 400 },
      );
    }
    provider = legacy.provider;
    encryptedKey = legacy.encryptedKey;
  }

  const visionImage = req.screenshotUrl || req.imageDataUri || null;
  if (!visionImage && !req.ocrText?.trim() && !req.note?.trim()) {
    return NextResponse.json(
      { error: "Provide a screenshot or text" },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  let clientGone = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: RunStreamEvent & { ticketId?: string }) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // Controller already closed/cancelled by the client disconnecting.
          closed = true;
        }
      };

      const markGone = () => {
        clientGone = true;
        diag("clientGone marked (abort)");
      };
      request.signal.addEventListener("abort", markGone, { once: true });
      diag("stream started", {
        signalAborted: request.signal.aborted,
      });

      try {
        const generator = streamTicketRun({
          provider,
          encryptedKey,
          req,
          userId,
          model: req.model,
        });

        for await (const event of generator) {
          if (event.type === "error" && event.code === "key_invalid") {
            setAiKeyStatus(userId, provider, "invalid").catch(() => {});
          }

          if (event.type !== "done") {
            // Client hit Stop or disconnected: abandon the loop so the
            // generator stops pulling further model calls.
            if (clientGone) {
              diag("breaking mid-stream (clientGone)", { type: event.type });
              break;
            }
            send(event);
            continue;
          }

          diag("done event received", { clientGone });
          // The generator produced a ticket — always persist it, even if the
          // client disconnected mid-stream. Throwing away a fully generated
          // ticket because the browser left is the bug that made History
          // silently empty.
          let ticketId: string | undefined;
          let saveFailed = false;
          try {
            const user = await getOrCreateUser(userId, "");
            diag("user resolved", { clerkUserId: user.clerkUserId });
            const ticketType = extractTicketType(
              event.ticket,
              req.ticketType,
            );

            const [savedTicket] = await db
              .insert(tickets)
              .values({
                userId: user.clerkUserId,
                ticketType,
                screenshotUrl: req.screenshotUrl || null,
                inputText: req.note || null,
                generatedTicket: event.ticket,
              })
              .returning();

            ticketId = savedTicket.id;
            diag("INSERT ok", { ticketId });

            if (event.needsReview) {
              await flagForHumanReview({
                reason: "needs_human_review",
                rawOutput: event.ticket,
                requestBody: req,
              });
            }
          } catch (saveError) {
            console.error("Failed to save ticket:", saveError);
            diag("INSERT FAILED", {
              message:
                saveError instanceof Error
                  ? saveError.message
                  : String(saveError),
              stack:
                saveError instanceof Error ? saveError.stack?.slice(0, 500) : undefined,
            });
            saveFailed = true;
          }

          // send() no-ops if the client is gone (controller already closed).
          send({ ...event, ticketId, saveFailed });
          diag("done sent", { ticketId, saveFailed, clientGone });
        }
      } catch (error) {
        console.error("Error streaming ticket generation:", error);
        diag("stream ERROR", {
          message: error instanceof Error ? error.message : String(error),
        });
        if (isAuthModelError(error)) {
          setAiKeyStatus(userId, provider, "invalid").catch(() => {});
          send({
            type: "error",
            message: `Your ${providerLabels[provider]} key was rejected. Replace it in API keys and try again.`,
            code: "key_invalid",
          });
        } else {
          send({
            type: "error",
            message: RUN_FAILED_MESSAGE,
            code: "internal_error",
          });
        }
      } finally {
        request.signal.removeEventListener("abort", markGone);
        try {
          controller.close();
        } catch {
          // Already closed by the client.
        }
      }
    },
    cancel() {
      clientGone = true;
      diag("stream cancel() called by consumer");
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
