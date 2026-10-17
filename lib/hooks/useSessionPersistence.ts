import { SESSION_KEY, type TicketType } from "@/lib/constants";

export interface SessionData {
  userId?: string;
  image: string | null;
  ticket: string;
  note: string;
  ticketType?: TicketType | null;
}

export function saveSession(
  image: string | null,
  ticket: string,
  note: string,
  ticketType: TicketType | undefined,
  userId: string | undefined,
): void {
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ userId, image, ticket, note, ticketType }),
    );
  } catch {}
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}
