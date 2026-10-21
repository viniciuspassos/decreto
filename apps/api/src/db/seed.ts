import { eq } from "drizzle-orm";
import { createDb, type Db } from "./client.js";
import { eventImages } from "./schema.js";

const initialEventImages = [
  { eventName: "prisao-oposicao", fileLocation: "prisao-oposicao/prisao-oposicao.png" },
  { eventName: "posse", fileLocation: "posse/juramento.png" },
  { eventName: "comicio", fileLocation: "comicio/palanque.png" },
];

export async function seedEventImages(db: Db): Promise<void> {
  for (const row of initialEventImages) {
    const [existing] = await db
      .select({ id: eventImages.id, fileLocation: eventImages.fileLocation })
      .from(eventImages)
      .where(eq(eventImages.eventName, row.eventName))
      .limit(1);

    if (!existing) {
      await db.insert(eventImages).values(row);
    } else if (existing.fileLocation !== row.fileLocation) {
      await db
        .update(eventImages)
        .set({ fileLocation: row.fileLocation })
        .where(eq(eventImages.id, existing.id));
    }
  }
}

export async function main(db: Db = createDb()): Promise<void> {
  await seedEventImages(db);
  console.log("[db] event_images seed applied");
}

export function handleCliError(error: unknown): void {
  console.error("[db] failed to apply seed", error);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  /* istanbul ignore next -- CLI bootstrap, not run when imported by tests */
  main().catch(handleCliError);
}
