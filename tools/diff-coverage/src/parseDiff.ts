import type { ChangedLinesByFile } from "./types.js";

const FILE_HEADER_RE = /^\+\+\+ (.+)$/;
const HUNK_HEADER_RE = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

function stripPrefix(path: string): string {
  return path.startsWith("b/") ? path.slice(2) : path;
}

function parseHunkStart(line: string): number | null {
  const match = HUNK_HEADER_RE.exec(line);
  return match ? Number(match[1]) : null;
}

function addChangedLine(changed: ChangedLinesByFile, file: string, line: number): void {
  const set = changed.get(file) ?? new Set<number>();
  set.add(line);
  changed.set(file, set);
}

/**
 * Parses a `git diff -U0` text into added line numbers per (new) file path.
 * Deleted files (`+++ /dev/null`) and removed lines are ignored — only lines
 * present in the new version of a file are tracked.
 */
export function parseDiff(diffText: string): ChangedLinesByFile {
  const changed: ChangedLinesByFile = new Map();
  let currentFile: string | null = null;
  let cursor = 0;

  for (const line of diffText.split("\n")) {
    const fileMatch = FILE_HEADER_RE.exec(line);
    if (fileMatch) {
      currentFile = fileMatch[1] === "/dev/null" ? null : stripPrefix(fileMatch[1]);
      continue;
    }

    const hunkStart = parseHunkStart(line);
    if (hunkStart !== null) {
      cursor = hunkStart;
      continue;
    }

    if (!currentFile) continue;

    if (line.startsWith("+")) {
      addChangedLine(changed, currentFile, cursor);
      cursor += 1;
    } else if (line.startsWith(" ")) {
      cursor += 1;
    }
  }

  return changed;
}
