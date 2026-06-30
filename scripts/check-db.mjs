import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
console.log("Columns:", rows.map(r => r.column_name).join(", "));
const hasNew = rows.some(r => r.column_name === "ai_encrypted_key");
console.log("Migration applied:", hasNew ? "YES" : "NO");
process.exit(0);
