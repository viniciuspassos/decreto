import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDb, type Db } from "./client.js";
import { eventImageAliases } from "./eventImageAliases.js";
import { readEventImageManifest } from "./imageManifest.js";
import { eventImages } from "./schema.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export function resolveAssetsDir(): string {
  const configuredDir = process.env.ASSETS_DIR;
  return configuredDir ? path.resolve(process.cwd(), configuredDir) : path.resolve(dirname, "../../../assets/images");
}

export async function seedEventImages(db: Db, assetsDir: string): Promise<void> {
  const manifest = await readEventImageManifest(assetsDir);
  const manifestLocations = new Set(manifest.map((row) => row.fileLocation));
  const eventNames = new Set(manifest.map((row) => row.eventName));
  const aliases = eventImageAliases.filter((alias) => manifestLocations.has(alias.fileLocation) && !eventNames.has(alias.eventName));
  const imageRows = [...manifest, ...aliases];
  const existingRows = await db.select({ eventName: eventImages.eventName, fileLocation: eventImages.fileLocation }).from(eventImages);
  const existingLocations = new Set(existingRows.map((row) => `${row.eventName}/${row.fileLocation}`));
  const newRows = imageRows.filter((row) => !existingLocations.has(`${row.eventName}/${row.fileLocation}`));

  if (newRows.length > 0) {
    await db.insert(eventImages).values(newRows);
  }
}

export async function main(db: Db = createDb(), assetsDir = resolveAssetsDir()): Promise<void> {
  await seedEventImages(db, assetsDir);
  console.log("[db] event_images seed applied");
}

export function handleCliError(error: unknown): void {
  console.error("[db] failed to apply seed", error);
  process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  /* istanbul ignore next -- CLI bootstrap, not run when imported by tests */
  const cliDb = createDb();
  /* istanbul ignore next -- CLI bootstrap, not run when imported by tests */
  main(cliDb).finally(() => cliDb.$client.end()).catch(handleCliError);
}
