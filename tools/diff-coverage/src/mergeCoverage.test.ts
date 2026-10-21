import type { CoverageMapData } from "istanbul-lib-coverage";
import { mergeCoverage } from "./mergeCoverage.js";


function fileData(path: string): CoverageMapData {
  return {
    [path]: {
      path,
      statementMap: {},
      s: {},
      branchMap: {},
      b: {},
      fnMap: {},
      f: {},
    },
  } as unknown as CoverageMapData;
}

describe("mergeCoverage", () => {
  it("combines coverage-final.json files from different packages into one map", () => {
    const map = mergeCoverage([fileData("/repo/a/src/x.ts"), fileData("/repo/b/src/y.ts")]);

    expect(map.files().sort()).toEqual(["/repo/a/src/x.ts", "/repo/b/src/y.ts"]);
  });

  it("returns an empty map when no coverage data exists", () => {
    expect(mergeCoverage([]).files()).toEqual([]);
  });
});
