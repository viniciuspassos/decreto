import istanbulLibCoverage, { type CoverageMapData } from "istanbul-lib-coverage";
import { findUncoveredChanges } from "./findUncovered.js";
import type { ChangedLinesByFile } from "./types.js";

const { createCoverageMap } = istanbulLibCoverage;

const REPO_ROOT = "/repo";
const FILE_PATH = "/repo/apps/api/src/app.ts";

function statement(line: number) {
  return { start: { line, column: 0 }, end: { line, column: 10 } };
}

function buildCoverageData(): CoverageMapData {
  return {
    [FILE_PATH]: {
      path: FILE_PATH,
      statementMap: { "0": statement(5), "1": statement(10) },
      s: { "0": 0, "1": 1 },
      branchMap: {},
      b: {},
      fnMap: {},
      f: {},
    },
  } as unknown as CoverageMapData;
}

function changes(lines: number[]): ChangedLinesByFile {
  return new Map([["apps/api/src/app.ts", new Set(lines)]]);
}

describe("findUncoveredChanges", () => {
  it("marks only lines with a zero-count statement as uncovered", () => {
    const coverageMap = createCoverageMap(buildCoverageData());

    const uncovered = findUncoveredChanges(changes([5, 10]), coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([{ file: "apps/api/src/app.ts", line: 5 }]);
  });

  it("ignores changed lines without a statement (comment/blank/type)", () => {
    const coverageMap = createCoverageMap(buildCoverageData());

    const uncovered = findUncoveredChanges(changes([7]), coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([]);
  });

  it("marks all changed lines when the file has never been executed", () => {
    const coverageMap = createCoverageMap({});

    const uncovered = findUncoveredChanges(changes([1, 2]), coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([
      { file: "apps/api/src/app.ts", line: 1 },
      { file: "apps/api/src/app.ts", line: 2 },
    ]);
  });

  it("marks an index.ts/types.ts PRESENT in coverage with a zero-count statement", () => {
    const indexPath = "/repo/packages/game-engine/src/index.ts";
    const coverageMap = createCoverageMap({
      [indexPath]: {
        path: indexPath,
        statementMap: { "0": statement(1) },
        s: { "0": 0 },
        branchMap: {},
        b: {},
        fnMap: {},
        f: {},
      },
    } as unknown as CoverageMapData);
    const changed: ChangedLinesByFile = new Map([["packages/game-engine/src/index.ts", new Set([1])]]);

    const uncovered = findUncoveredChanges(changed, coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([{ file: "packages/game-engine/src/index.ts", line: 1 }]);
  });

  it("does not mark an index.ts/types.ts ABSENT from coverage (barrel without statements)", () => {
    const coverageMap = createCoverageMap({});
    const changed: ChangedLinesByFile = new Map([["packages/game-engine/src/index.ts", new Set([1])]]);

    const uncovered = findUncoveredChanges(changed, coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([]);
  });
});
