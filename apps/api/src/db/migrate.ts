import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb } from "./client.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

async function main(): Promise<void> {
  const db = createDb();
  await migrate(db, { migrationsFolder: path.resolve(dirname, "../../drizzle") });
  console.log("[db] migrations aplicadas");
}

main().catch((error: unknown) => {
  console.error("[db] falha ao aplicar migrations", error);
  process.exitCode = 1;
});
