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
  it("marca como não cobertas apenas as linhas com statement de contagem zero", () => {
    const coverageMap = createCoverageMap(buildCoverageData());

    const uncovered = findUncoveredChanges(changes([5, 10]), coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([{ file: "apps/api/src/app.ts", line: 5 }]);
  });

  it("ignora linhas alteradas sem nenhum statement (comentário/branco/tipo)", () => {
    const coverageMap = createCoverageMap(buildCoverageData());

    const uncovered = findUncoveredChanges(changes([7]), coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([]);
  });

  it("marca todas as linhas alteradas quando o arquivo nunca foi executado", () => {
    const coverageMap = createCoverageMap({});

    const uncovered = findUncoveredChanges(changes([1, 2]), coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([
      { file: "apps/api/src/app.ts", line: 1 },
      { file: "apps/api/src/app.ts", line: 2 },
    ]);
  });

  it("marca um index.ts/types.ts PRESENTE na coverage com statement de contagem zero", () => {
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

  it("não marca um index.ts/types.ts AUSENTE da coverage (barril sem statements)", () => {
    const coverageMap = createCoverageMap({});
    const changed: ChangedLinesByFile = new Map([["packages/game-engine/src/index.ts", new Set([1])]]);

    const uncovered = findUncoveredChanges(changed, coverageMap, REPO_ROOT);

    expect(uncovered).toEqual([]);
  });
});
