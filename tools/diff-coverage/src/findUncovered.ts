import { join } from "node:path";
import type { CoverageMap, FileCoverage } from "istanbul-lib-coverage";
import type { ChangedLinesByFile, UncoveredChange } from "./types.js";

function findFileCoverage(
  coverageMap: CoverageMap,
  knownFiles: Set<string>,
  absolutePath: string,
): FileCoverage | null {
  return knownFiles.has(absolutePath) ? coverageMap.fileCoverageFor(absolutePath) : null;
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
      for (const line of lines) uncovered.push({ file, line });
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
