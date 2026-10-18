import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema.js";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não está definida.");
  }
  return url;
}

export function createDb(connectionString = requireDatabaseUrl()) {
  const pool = new Pool({ connectionString });
  return drizzle(pool, { schema });
}

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
