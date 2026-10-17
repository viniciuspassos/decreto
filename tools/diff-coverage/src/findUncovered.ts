import { basename, join } from "node:path";
import type { CoverageMap, FileCoverage } from "istanbul-lib-coverage";
import type { ChangedLinesByFile, UncoveredChange } from "./types.js";

// Barrels (`index.ts`) and pure-type modules (`types.ts`) that only re-export or
// declare types compile to zero Istanbul statements, so they never appear in
// coverage-final.json even when imported by a test. A *present* index.ts/types.ts
// (one with real statements) is still gated normally — only their absence is excused.
const UNINSTRUMENTABLE_BASENAME = /^(index|types)\.ts$/;

function findFileCoverage(
  coverageMap: CoverageMap,
  knownFiles: Set<string>,
  absolutePath: string,
): FileCoverage | null {
  return knownFiles.has(absolutePath) ? coverageMap.fileCoverageFor(absolutePath) : null;
}

function flagMissingFile(file: string, lines: Set<number>, uncovered: UncoveredChange[]): void {
  if (UNINSTRUMENTABLE_BASENAME.test(basename(file))) return;
  for (const line of lines) uncovered.push({ file, line });
}

/**
 * A changed line fails the gate when either the whole file was never
 * executed by any test, or istanbul recorded a statement on that line with
 * zero hits. Lines with no statement at all (blank, comments, type-only
 * declarations) are not gated — istanbul never instruments them.
 */
export function findUncoveredChanges(
  changedLines: ChangedLinesByFile,
  coverageMap: CoverageMap,
  repoRoot: string,
): UncoveredChange[] {
  const uncovered: UncoveredChange[] = [];
  const knownFiles = new Set(coverageMap.files());

  for (const [file, lines] of changedLines) {
    const fileCoverage = findFileCoverage(coverageMap, knownFiles, join(repoRoot, file));

    if (!fileCoverage) {
      flagMissingFile(file, lines, uncovered);
      continue;
    }

    const lineHits = fileCoverage.getLineCoverage();
    for (const line of lines) {
      if (lineHits[line] === 0) {
        uncovered.push({ file, line });
      }
    }
  }

  return uncovered;
}
