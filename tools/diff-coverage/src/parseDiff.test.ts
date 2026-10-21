import { parseDiff } from "./parseDiff.js";

describe("parseDiff", () => {
  it("collects added line numbers in a modified file", () => {
    const diff = [
      "diff --git a/src/foo.ts b/src/foo.ts",
      "index abc123..def456 100644",
      "--- a/src/foo.ts",
      "+++ b/src/foo.ts",
      "@@ -10,0 +11,2 @@ export function foo() {",
      "+  line1",
      "+  line2",
      "",
    ].join("\n");

    const changed = parseDiff(diff);

    expect(changed.get("src/foo.ts")).toEqual(new Set([11, 12]));
  });

  it("ignores removed lines and does not move the new version cursor", () => {
    const diff = [
      "diff --git a/src/bar.ts b/src/bar.ts",
      "--- a/src/bar.ts",
      "+++ b/src/bar.ts",
      "@@ -20,3 +20,1 @@ export function bar() {",
      "-removed1",
      "-removed2",
      "+kept",
      "",
    ].join("\n");

    const changed = parseDiff(diff);

    expect(changed.get("src/bar.ts")).toEqual(new Set([20]));
  });

  it("ignores deleted files (+++ /dev/null)", () => {
    const diff = [
      "diff --git a/src/old.ts b/src/old.ts",
      "deleted file mode 100644",
      "--- a/src/old.ts",
      "+++ /dev/null",
      "@@ -1,2 +0,0 @@",
      "-removed1",
      "-removed2",
      "",
    ].join("\n");

    const changed = parseDiff(diff);

    expect(changed.size).toBe(0);
  });

  it("handles multiple hunks in the same file independently", () => {
    const diff = [
      "diff --git a/src/multi.ts b/src/multi.ts",
      "--- a/src/multi.ts",
      "+++ b/src/multi.ts",
      "@@ -1,0 +2,1 @@",
      "+top",
      "@@ -50,0 +52,1 @@",
      "+bottom",
      "",
    ].join("\n");

    const changed = parseDiff(diff);

    expect(changed.get("src/multi.ts")).toEqual(new Set([2, 52]));
  });

  it("returns an empty map for a diff with no content", () => {
    expect(parseDiff("").size).toBe(0);
  });

  it("advances the cursor on context lines for diffs with -U greater than 0", () => {
    const diff = [
      "diff --git a/src/ctx.ts b/src/ctx.ts",
      "--- a/src/ctx.ts",
      "+++ b/src/ctx.ts",
      "@@ -8,3 +8,4 @@ export function ctx() {",
      " context1",
      " context2",
      "+added",
      " context3",
      "",
    ].join("\n");

    const changed = parseDiff(diff);

    expect(changed.get("src/ctx.ts")).toEqual(new Set([10]));
  });
});
