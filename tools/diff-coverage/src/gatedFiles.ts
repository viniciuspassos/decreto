import type { ChangedLinesByFile } from "./types.js";

const GATED_PATTERN = /^(apps|packages|tools)\/[^/]+\/src\/.*\.tsx?$/;
// Barrels (`index.ts`) and pure-type modules (`types.ts`) compile to re-export/
// type-only statements that Istanbul never instruments, so they can never show
// up in coverage-final.json — gating them would always fail, regardless of tests.
const EXCLUDED_PATTERN = /(\.test\.tsx?|\/(index|types)\.ts)$/;

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
