import type { ChangedLinesByFile } from "./types.js";

const GATED_PATTERN = /^(apps|packages|tools)\/[^/]+\/src\/.*\.tsx?$/;
const EXCLUDED_PATTERN = /\.test\.tsx?$/;

/** Keeps only app/package source files that the coverage gate cares about. */
export function filterGatedChanges(changed: ChangedLinesByFile): ChangedLinesByFile {
  const filtered: ChangedLinesByFile = new Map();

  for (const [file, lines] of changed) {
    if (GATED_PATTERN.test(file) && !EXCLUDED_PATTERN.test(file)) {
      filtered.set(file, lines);
    }
  }

  return filtered;
}
