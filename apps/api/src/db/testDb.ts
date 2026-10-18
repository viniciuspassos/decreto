import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "./schema.js";
import type { Db } from "./client.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultMigrationsFolder = path.resolve(dirname, "../../drizzle");

export interface TestDb {
  db: Db;
  close: () => Promise<void>;
}

export interface CreateTestDbOptions {
  /** false pula as migrations — só serve para testar falha de conexão (banco já fechado). */
  runMigrations?: boolean;
  /** só para testar o tratamento de falha de migration; default é a pasta real de migrations. */
  migrationsFolder?: string;
}

export async function createTestDb({
  runMigrations = true,
  migrationsFolder = defaultMigrationsFolder,
}: CreateTestDbOptions = {}): Promise<TestDb> {
  const client = await PGlite.create();
  const db = drizzle(client, { schema });

  if (runMigrations) {
    try {
      await migrate(db, { migrationsFolder });
    } catch (error) {
      await client.close();
      throw error;
    }
  }

  return { db, close: () => client.close() };
}
