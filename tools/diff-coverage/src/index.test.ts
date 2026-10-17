import * as diffCoverage from "./index.js";

describe("index", () => {
  it("expõe a API pública do pacote", () => {
    expect(typeof diffCoverage.parseDiff).toBe("function");
    expect(typeof diffCoverage.filterGatedChanges).toBe("function");
    expect(typeof diffCoverage.mergeCoverage).toBe("function");
    expect(typeof diffCoverage.findUncoveredChanges).toBe("function");
    expect(typeof diffCoverage.getDiffText).toBe("function");
    expect(typeof diffCoverage.getRepoRoot).toBe("function");
    expect(typeof diffCoverage.findCoverageFiles).toBe("function");
    expect(typeof diffCoverage.loadCoverageData).toBe("function");
  });
});
