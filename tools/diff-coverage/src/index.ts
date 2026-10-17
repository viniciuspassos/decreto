export { parseDiff } from "./parseDiff.js";
export { filterGatedChanges } from "./gatedFiles.js";
export { mergeCoverage } from "./mergeCoverage.js";
export { findUncoveredChanges } from "./findUncovered.js";
export { getDiffText, getRepoRoot } from "./gitDiff.js";
export { findCoverageFiles, loadCoverageData } from "./loadCoverage.js";
export type { ChangedLinesByFile, UncoveredChange } from "./types.js";
