import { readFile } from "node:fs/promises";
import fg from "fast-glob";
import type { CoverageMapData } from "istanbul-lib-coverage";

export function findCoverageFiles(repoRoot: string): Promise<string[]> {
  return fg("{apps,packages,tools}/*/coverage/coverage-final.json", {
    cwd: repoRoot,
    absolute: true,
  });
}

export async function loadCoverageData(repoRoot: string): Promise<CoverageMapData[]> {
  const files = await findCoverageFiles(repoRoot);
  const contents = await Promise.all(files.map((file) => readFile(file, "utf8")));
  return contents.map((content) => JSON.parse(content) as CoverageMapData);
}
