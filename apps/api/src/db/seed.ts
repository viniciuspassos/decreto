import { and, eq } from "drizzle-orm";
import { createDb, type Db } from "./client.js";
import { eventImages } from "./schema.js";

const initialEventImages = [
  { eventName: "prisao-oposicao", fileLocation: "eventos/prisao-oposicao.png" },
];

export async function seedEventImages(db: ReturnType<typeof createDb>): Promise<void> {
  for (const row of initialEventImages) {
    const existing = await db
      .select({ id: eventImages.id })
      .from(eventImages)
      .where(and(eq(eventImages.eventName, row.eventName), eq(eventImages.fileLocation, row.fileLocation)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(eventImages).values(row);
    }
  }
}

export async function main(db: Db = createDb()): Promise<void> {
  await seedEventImages(db);
  console.log("[db] seed de event_images aplicado");
}

export function handleCliError(error: unknown): void {
  console.error("[db] falha ao aplicar seed", error);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(handleCliError);
}
