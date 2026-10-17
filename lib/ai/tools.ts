import { tool } from "langchain";
import * as z from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import {
  TICKET_TITLE_MAX_LENGTH,
  TICKET_TYPE_META,
  TICKET_TYPES,
} from "@/lib/constants";

const PRIORITY_GUIDELINES = `
CRITICAL — production down, data loss, security issue, no workaround. Severity: CRITICAL.
HIGH — major feature broken, blocks most users, only a difficult workaround. Severity: HIGH.
MEDIUM — noticeable defect with a workaround, affects a subset of users. Severity: MEDIUM.
LOW — cosmetic, typo, minor polish, rare edge case. Severity: LOW.
Priority and severity must agree with each other and with what is actually visible in the input.
`.trim();

export function createTicketTools(userId: string) {
  const searchPastTickets = tool(
    async ({ query, limit }) => {
      const rows = await db
        .select({
          id: tickets.id,
          ticketType: tickets.ticketType,
          generatedTicket: tickets.generatedTicket,
          createdAt: tickets.createdAt,
        })
        .from(tickets)
        .where(
          and(
            eq(tickets.userId, userId),
            sql`${tickets.generatedTicket} ILIKE ${"%" + query + "%"}`,
          ),
        )
        .orderBy(desc(tickets.createdAt))
        .limit(Math.min(limit, 10));

      if (rows.length === 0) {
        return `No past tickets matched "${query}".`;
      }

      return rows
        .map((row) => {
          let title = "(untitled)";
          let priority = "";
          try {
            const parsed = JSON.parse(row.generatedTicket) as {
              title?: string;
              priority?: string;
            };
            title = parsed.title || title;
            priority = parsed.priority || "";
          } catch {}
          return `- [${row.ticketType || "unknown"}] ${title}${
            priority ? ` (${priority})` : ""
          } — created ${row.createdAt.toISOString().slice(0, 10)}`;
        })
        .join("\n");
    },
    {
      name: "search_past_tickets",
      description:
        "Search this user's previously generated tickets by keyword. Use it to find duplicates or prior context before drafting a new ticket.",
      schema: z.object({
        query: z
          .string()
          .describe("Keyword or short phrase to search for in past tickets"),
        limit: z
          .number()
          .min(1)
          .max(10)
          .describe("Maximum number of results to return (use 5 unless asked otherwise)"),
      }),
    },
  );

  const getTicketTemplate = tool(
    ({ type }) => {
      const meta = TICKET_TYPE_META[type];
      const templates: Record<(typeof TICKET_TYPES)[number], string> = {
        bug: "title, priority, description, steps, expected, actual, environment, severity, component",
        feature:
          "title, priority, description, userStory, acceptanceCriteria, scope",
        ui: "title, priority, description, location, expected, actual, steps, environment",
        feedback: "title, priority, description, summary, sentiment, actionItems",
        task: "title, priority, description, checklist",
      };
      return `Ticket type "${type}" (${meta.label}) — ${meta.description}
Required fields: ${templates[type]}
Max title length: ${TICKET_TITLE_MAX_LENGTH} characters.`;
    },
    {
      name: "get_ticket_template",
      description:
        "Return the required fields for a given ticket type. Call this when you are unsure which fields to fill.",
      schema: z.object({
        type: z.enum(TICKET_TYPES),
      }),
    },
  );

  const getPriorityGuidelines = tool(
    () => PRIORITY_GUIDELINES,
    {
      name: "get_priority_guidelines",
      description:
        "Return the priority/severity rubric used to decide priority (CRITICAL/HIGH/MEDIUM/LOW). Call this before setting priority or severity.",
      schema: z.object({}),
    },
  );

  return [searchPastTickets, getTicketTemplate, getPriorityGuidelines];
}
