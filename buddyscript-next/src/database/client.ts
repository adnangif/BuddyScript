import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const neonClient = neon(connectionString);

// Singleton pattern to prevent hot-reload duplicates
declare global {
  // eslint-disable-next-line no-var
  var dbClient: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

export const dbClient = globalThis.dbClient ?? drizzle(neonClient, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.dbClient = dbClient;
}

export type DbClient = typeof dbClient;
