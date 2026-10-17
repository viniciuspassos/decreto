import { getDiffText, getRepoRoot } from "./gitDiff.js";
import { parseDiff } from "./parseDiff.js";
import { filterGatedChanges } from "./gatedFiles.js";
import { loadCoverageData } from "./loadCoverage.js";
import { mergeCoverage } from "./mergeCoverage.js";
import { findUncoveredChanges } from "./findUncovered.js";
import type { UncoveredChange } from "./types.js";

function reportUncovered(uncovered: UncoveredChange[]): void {
  console.error("diff-coverage: linhas alteradas sem teste cobrindo:");
  for (const { file, line } of uncovered) {
    console.error(`  ${file}:${line}`);
  }
}

async function main(): Promise<void> {
  const baseRef = process.argv[2] ?? "origin/main";
  const repoRoot = getRepoRoot(process.cwd());

  const changed = filterGatedChanges(parseDiff(getDiffText(baseRef, repoRoot)));
  if (changed.size === 0) {
    console.log("diff-coverage: nenhum arquivo de código-fonte alterado.");
    return;
  }

  const coverageData = await loadCoverageData(repoRoot);
  if (coverageData.length === 0) {
    console.error("diff-coverage: nenhum coverage-final.json encontrado — rode `pnpm test` antes.");
    process.exitCode = 1;
    return;
  }

  const uncovered = findUncoveredChanges(changed, mergeCoverage(coverageData), repoRoot);
  if (uncovered.length > 0) {
    reportUncovered(uncovered);
    process.exitCode = 1;
    return;
  }

  console.log("diff-coverage: ok — todo código alterado está exercitado por testes.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
