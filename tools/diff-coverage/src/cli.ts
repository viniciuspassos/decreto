import { getDiffText, getRepoRoot } from "./gitDiff.js";
import { parseDiff } from "./parseDiff.js";
import { filterGatedChanges } from "./gatedFiles.js";
import { loadCoverageData } from "./loadCoverage.js";
import { mergeCoverage } from "./mergeCoverage.js";
import { findUncoveredChanges } from "./findUncovered.js";
import type { UncoveredChange } from "./types.js";

function reportUncovered(uncovered: UncoveredChange[]): void {
  console.error("diff-coverage: changed lines are not covered by tests:");
  for (const { file, line } of uncovered) {
    console.error(`  ${file}:${line}`);
  }
}

/** Core orchestration, exit code only — no process access, so it's unit-testable. */
export async function run(baseRef: string, cwd: string): Promise<number> {
  const repoRoot = getRepoRoot(cwd);
  const changed = filterGatedChanges(parseDiff(getDiffText(baseRef, repoRoot)));

  if (changed.size === 0) {
    console.log("diff-coverage: no source files changed.");
    return 0;
  }

  const coverageData = await loadCoverageData(repoRoot);
  if (coverageData.length === 0) {
    console.error("diff-coverage: no coverage-final.json found — run `pnpm test` first.");
    return 1;
  }

  const uncovered = findUncoveredChanges(changed, mergeCoverage(coverageData), repoRoot);
  if (uncovered.length > 0) {
    reportUncovered(uncovered);
    return 1;
  }

  console.log("diff-coverage: ok — all changed code is exercised by tests.");
  return 0;
}
