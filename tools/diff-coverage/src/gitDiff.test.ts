import { execFileSync } from "node:child_process";
import { mkdtemp, rm, writeFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getDiffText, getRepoRoot } from "./gitDiff.js";

function git(args: string[], cwd: string): void {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

describe("getRepoRoot / getDiffText", () => {
  let repoRoot: string;

  beforeEach(async () => {
    repoRoot = await realpath(await mkdtemp(join(tmpdir(), "diff-coverage-git-fixture-")));
    git(["init"], repoRoot);
    git(["config", "user.email", "test@example.com"], repoRoot);
    git(["config", "user.name", "Test"], repoRoot);
    await writeFile(join(repoRoot, "file.ts"), "export const a = 1;\n");
    git(["add", "file.ts"], repoRoot);
    git(["commit", "-m", "chore: initial"], repoRoot);
  });

  afterEach(async () => {
    await rm(repoRoot, { recursive: true, force: true });
  });

  it("getRepoRoot points to the created repository root", () => {
    expect(getRepoRoot(repoRoot)).toBe(repoRoot);
  });

  it("getDiffText returns empty when HEAD has not changed", () => {
    expect(getDiffText("HEAD", repoRoot)).toBe("");
  });

  it("getDiffText shows the added line after a new commit", async () => {
    await writeFile(join(repoRoot, "file.ts"), "export const a = 1;\nexport const b = 2;\n");
    git(["add", "file.ts"], repoRoot);
    git(["commit", "-m", "feat: add b"], repoRoot);

    expect(getDiffText("HEAD~1", repoRoot)).toContain("+export const b = 2;");
  });
});
