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
  it("combina coverage-final.json de pacotes diferentes num único mapa", () => {
    const map = mergeCoverage([fileData("/repo/a/src/x.ts"), fileData("/repo/b/src/y.ts")]);

    expect(map.files().sort()).toEqual(["/repo/a/src/x.ts", "/repo/b/src/y.ts"]);
  });

  it("retorna mapa vazio quando não há dados de coverage", () => {
    expect(mergeCoverage([]).files()).toEqual([]);
  });
});
