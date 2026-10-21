import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = process.env.MIGRATIONS_DIR ?? path.resolve(dirname, "../../drizzle");

export async function runMigrations<T>(
  db: T,
  migrator: (database: T, config: { migrationsFolder: string }) => Promise<void>,
): Promise<void> {
  await migrator(db, { migrationsFolder });
}

export async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database migrations.");
  }

  const pool = new Pool({ connectionString });
  try {
    await runMigrations(drizzle(pool), migrate);
    console.log("[db] migrations applied");
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  /* istanbul ignore next -- CLI bootstrap, verified through Compose */
  main().catch((error: unknown) => {
    console.error("[db] failed to apply migrations", error);
    process.exitCode = 1;
  });
}
