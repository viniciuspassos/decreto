import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findCoverageFiles, loadCoverageData } from "./loadCoverage.js";

describe("findCoverageFiles / loadCoverageData", () => {
  let repoRoot: string;

  beforeEach(async () => {
    repoRoot = await mkdtemp(join(tmpdir(), "diff-coverage-fixture-"));
    const coverageDir = join(repoRoot, "packages", "fake-pkg", "coverage");
    await mkdir(coverageDir, { recursive: true });
    await writeFile(
      join(coverageDir, "coverage-final.json"),
      JSON.stringify({ "/repo/packages/fake-pkg/src/a.ts": { path: "/repo/packages/fake-pkg/src/a.ts" } }),
    );
  });

  afterEach(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });

  it("encontra coverage-final.json sob apps/packages/tools", async () => {
    const files = await findCoverageFiles(repoRoot);

    expect(files).toEqual([join(repoRoot, "packages", "fake-pkg", "coverage", "coverage-final.json")]);
  });

  it("carrega e faz parse do conteúdo de cada coverage-final.json encontrado", async () => {
    const data = await loadCoverageData(repoRoot);

    expect(data).toEqual([{ "/repo/packages/fake-pkg/src/a.ts": { path: "/repo/packages/fake-pkg/src/a.ts" } }]);
  });

  it("retorna lista vazia quando não há nenhum coverage-final.json", async () => {
    await rm(join(repoRoot, "packages"), { recursive: true, force: true });

    expect(await loadCoverageData(repoRoot)).toEqual([]);
  });
});
