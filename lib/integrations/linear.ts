import type { Ticket, SendResult } from "./types";

const LINEAR_API = "https://api.linear.app/graphql";

function extractTitle(raw: string): string {
  const titleMatch = raw.match(/^(?:Title:|🐛)\s*(.+)/m);
  if (titleMatch) return titleMatch[1].trim();
  const lines = raw.trim().split("\n").filter(Boolean);
  return lines[0]?.slice(0, 100) || "Untitled ticket";
}

function extractDescription(raw: string): string {
  const descMatch = raw.match(/^(?:Description:|📝)\s*([\s\S]*?)(?=^(?:Steps to Reproduce:|🔄|Expected Behavior:|✅|Actual Behavior:|❌|Environment:|🌍|Additional Notes:|📌|Priority:|📊))/m);
  if (descMatch) return descMatch[1].trim();
  const lines = raw.trim().split("\n");
  return lines.slice(1).join("\n").trim().slice(0, 5000) || raw;
}

function formatForLinear(ticket: Ticket): { title: string; description: string } {
  let description = ticket.description;
  if (ticket.priority) {
    description = `**Priority:** ${ticket.priority}\n\n${description}`;
  }
  if (ticket.steps && ticket.steps.length > 0) {
    description += "\n\n**Steps to Reproduce:**\n";
    ticket.steps.forEach((s, i) => {
      description += `${i + 1}. ${s}\n`;
    });
  }
  return {
    title: ticket.title.slice(0, 255),
    description,
  };
}

async function linearQuery(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors?.[0]?.message || `Linear API error (${res.status})`;
    throw new Error(msg);
  }
  return json.data;
}

async function getFirstTeamId(apiKey: string): Promise<string> {
  const query = `
    query Teams {
      teams(first: 1) {
        nodes { id }
      }
    }
  `;
  const data = await linearQuery(apiKey, query) as { teams: { nodes: { id: string }[] } };
  const id = data.teams?.nodes?.[0]?.id;
  if (!id) {
    throw new Error("No Linear team found. Create a team in Linear first.");
  }
  return id;
}

async function linearMutation(
  apiKey: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors?.[0]?.message || `Linear API error (${res.status})`;
    throw new Error(msg);
  }
  return json.data;
}

export async function createLinearIssue(
  ticket: Ticket,
  apiKey: string,
): Promise<SendResult> {
  try {
    const [teamId, { title, description }] = await Promise.all([
      getFirstTeamId(apiKey),
      Promise.resolve(formatForLinear(ticket)),
    ]);

    const mutation = `
      mutation IssueCreate($teamId: String!, $title: String!, $description: String) {
        issueCreate(input: { teamId: $teamId, title: $title, description: $description }) {
          success
          issue {
            id
            url
          }
        }
      }
    `;

    const data = await linearMutation(apiKey, mutation, {
      teamId,
      title,
      description,
    }) as { issueCreate: { success: boolean; issue: { id: string; url: string } } };

    if (!data.issueCreate?.success) {
      return { success: false, error: "Linear failed to create issue" };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create Linear issue",
    };
  }
}

export function parseTicketText(raw: string): Ticket {
  try {
    const parsed = JSON.parse(raw);
    if (parsed.title) {
      return {
        title: parsed.title,
        description: parsed.description || "",
        priority: parsed.priority,
        steps: Array.isArray(parsed.steps) ? parsed.steps : undefined,
      };
    }
  } catch {}

  return {
    title: extractTitle(raw),
    description: extractDescription(raw),
    priority: undefined,
    steps: undefined,
  };
}
