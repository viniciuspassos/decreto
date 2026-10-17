import { execFileSync } from "node:child_process";

/** Diff of the current HEAD against the merge-base with `baseRef`, zero context lines. */
export function getDiffText(baseRef: string, cwd: string): string {
  return execFileSync("git", ["diff", "--merge-base", baseRef, "-U0", "--no-color"], {
    cwd,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
}

export function getRepoRoot(cwd: string): string {
  return execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" }).trim();
}
