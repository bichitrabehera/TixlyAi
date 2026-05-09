import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "snapshot.db");
export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS slack_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    access_token TEXT NOT NULL,
    user_id TEXT NOT NULL,
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export function saveSlackToken(accessToken: string, userId: string, teamId?: string) {
  db.prepare("DELETE FROM slack_tokens").run();
  db.prepare("INSERT INTO slack_tokens (access_token, user_id, team_id) VALUES (?, ?, ?)").run(accessToken, userId, teamId || null);
}

export function getSlackToken() {
  return db.prepare("SELECT access_token, user_id, team_id FROM slack_tokens LIMIT 1").get() as { access_token: string; user_id: string; team_id: string } | undefined;
}

export function isSlackConnected() {
  const row = db.prepare("SELECT id FROM slack_tokens LIMIT 1").get();
  return !!row;
}