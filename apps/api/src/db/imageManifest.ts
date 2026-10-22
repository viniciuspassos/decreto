import { readdir } from "node:fs/promises";
import path from "node:path";

export interface EventImageManifestEntry {
  eventName: string;
  fileLocation: string;
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export async function readEventImageManifest(assetsDir: string): Promise<EventImageManifestEntry[]> {
  const eventDirectories = await readdir(assetsDir, { withFileTypes: true });
  const entries = await Promise.all(
    eventDirectories.filter((entry) => entry.isDirectory()).map((entry) => readEventDirectory(assetsDir, entry.name)),
  );
  return entries.flat();
}

async function readEventDirectory(assetsDir: string, eventName: string): Promise<EventImageManifestEntry[]> {
  const eventDir = path.join(assetsDir, eventName);
  const files = await readdir(eventDir, { withFileTypes: true });
  return files
    .filter((file) => file.isFile() && IMAGE_EXTENSIONS.has(path.extname(file.name).toLowerCase()))
    .map((file) => ({ eventName, fileLocation: path.posix.join(eventName, file.name) }));
}
