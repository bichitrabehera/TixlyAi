import "dotenv/config";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getOrCreateUser, getAiKey, listAiKeys, setAiKeyStatus } from "@/lib/db/users";
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

function extractTicketType(ticketJson: string, fallback?: string): string | null {
  try {
    const parsed = JSON.parse(ticketJson) as { type?: string };
    return parsed.type || fallback || null;
  } catch {
    return fallback || null;
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: RunStreamEvent & { ticketId?: string }) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        for await (const event of streamTicketRun({
          provider,
          encryptedKey,
          req,
          userId,
        })) {
          if (event.type !== "done") {
            send(event);
            continue;
          }

          let ticketId: string | undefined;
          try {
            const user = await getOrCreateUser(userId, "");
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

            if (event.needsReview) {
              await flagForHumanReview({
                reason: "needs_human_review",
                rawOutput: event.ticket,
                requestBody: req,
              });
            }
          } catch (saveError) {
            console.error("Failed to save ticket:", saveError);
          }

          send({ ...event, ticketId });
        }
      } catch (error) {
        console.error("Error streaming ticket generation:", error);
        const rawMessage =
          error instanceof Error ? error.message : "Failed to generate ticket";
        const authRejected =
          /api key|unauthorized|authentication|invalid x-api-key|permission|401/i.test(
            rawMessage,
          );

        if (authRejected) {
          setAiKeyStatus(userId, provider, "invalid").catch(() => {});
          send({
            type: "error",
            message: `Your ${providerLabels[provider]} key was rejected. Replace it in API keys and try again.`,
            code: "key_invalid",
          });
        } else {
          send({
            type: "error",
            message: rawMessage,
            code: "internal_error",
          });
        }
      } finally {
        controller.close();
      }
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
