import { eq, sql } from "drizzle-orm";
import type { Db } from "./client.js";
import { eventImages } from "./schema.js";

export async function findImageForEvent(db: Db, eventName: string): Promise<string | null> {
  const rows = await db
    .select({ fileLocation: eventImages.fileLocation })
    .from(eventImages)
    .where(eq(eventImages.eventName, eventName))
    .orderBy(sql`random()`);

  const directImage = rows.find((row) => row.fileLocation.startsWith(`${eventName}/`));
  return directImage?.fileLocation ?? rows[0]?.fileLocation ?? null;
}
