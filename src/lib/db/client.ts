import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Add your Supabase Postgres connection string to .env.local."
    );
  }
  try {
    // Validates shape early — postgres package also throws "Invalid URL"
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    throw new Error(
      'DATABASE_URL is invalid. Use a single line like postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres (no nested DATABASE_URL= or broken quotes).'
    );
  }
  if (!dbInstance) {
    client = postgres(url, { prepare: false, max: 5 });
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}
