import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { jest } from "@jest/globals";
import { run } from "./cli.js";

function git(args: string[], cwd: string): void {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

function coverageFixture(filePath: string, hits: number) {
  return {
    [filePath]: {
      path: filePath,
      statementMap: { "0": { start: { line: 2, column: 0 }, end: { line: 2, column: 10 } } },
      s: { "0": hits },
      branchMap: {},
      b: {},
      fnMap: {},
      f: {},
    },
  };
}

describe("run", () => {
  let repoRoot: string;
  let logicFile: string;

  beforeEach(async () => {
    repoRoot = await realpath(await mkdtemp(join(tmpdir(), "diff-coverage-cli-fixture-")));
    logicFile = join(repoRoot, "packages", "fake", "src", "logic.ts");

    git(["init"], repoRoot);
    git(["config", "user.email", "test@example.com"], repoRoot);
    git(["config", "user.name", "Test"], repoRoot);

    await mkdir(join(repoRoot, "packages", "fake", "src"), { recursive: true });
    await writeFile(logicFile, "export function noop(): number {\n  return 1;\n}\n");
    git(["add", "."], repoRoot);
    git(["commit", "-m", "chore: initial"], repoRoot);

    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await rm(repoRoot, { recursive: true, force: true });
  });

  it("retorna 0 quando não há arquivos de src alterados", async () => {
    expect(await run("HEAD", repoRoot)).toBe(0);
  });

  async function changeLogicLine(): Promise<void> {
    await writeFile(logicFile, "export function noop(): number {\n  return 2;\n}\n");
    git(["add", "."], repoRoot);
    git(["commit", "-m", "feat: change return value"], repoRoot);
  }

  it("retorna 1 quando não há nenhum coverage-final.json gerado ainda", async () => {
    await changeLogicLine();

    expect(await run("HEAD~1", repoRoot)).toBe(1);
  });

  it("retorna 0 quando a linha alterada está coberta", async () => {
    await changeLogicLine();
    const coverageDir = join(repoRoot, "packages", "fake", "coverage");
    await mkdir(coverageDir, { recursive: true });
    await writeFile(
      join(coverageDir, "coverage-final.json"),
      JSON.stringify(coverageFixture(logicFile, 1)),
    );

    expect(await run("HEAD~1", repoRoot)).toBe(0);
  });

  it("retorna 1 quando a linha alterada não está coberta", async () => {
    await changeLogicLine();
    const coverageDir = join(repoRoot, "packages", "fake", "coverage");
    await mkdir(coverageDir, { recursive: true });
    await writeFile(
      join(coverageDir, "coverage-final.json"),
      JSON.stringify(coverageFixture(logicFile, 0)),
    );

    expect(await run("HEAD~1", repoRoot)).toBe(1);
  });
});
