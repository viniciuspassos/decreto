import { readFileSync } from "node:fs";
import type { ManifestEntry } from "./types.js";

const NAME_PATTERN = /^[a-z0-9-]+$/;

/** Validates and normalizes raw manifest content (an array of entries). */
export function parseManifest(raw: string): ManifestEntry[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("manifest must be an array of entries");
  }
  return data.map((entry, index) => validateEntry(entry, index));
}

function validateEntry(entry: unknown, index: number): ManifestEntry {
  if (typeof entry !== "object" || entry === null) {
    throw new Error(`entry ${index} is invalid: expected an object`);
  }

  const { category, name, prompt, seed } = entry as Record<string, unknown>;
  requireSlug(category, index, "category");
  requireSlug(name, index, "name");

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error(`entry ${index}: "prompt" must be a non-empty string`);
  }
  if (seed !== undefined && typeof seed !== "number") {
    throw new Error(`entry ${index}: "seed" must be a number`);
  }

  return { category: category as string, name: name as string, prompt, seed };
}

function requireSlug(value: unknown, index: number, field: string): void {
  if (typeof value !== "string" || !NAME_PATTERN.test(value)) {
    throw new Error(`entry ${index}: "${field}" must be lowercase and contain only letters, numbers, or hyphens`);
  }
}

export function loadManifest(path: string): ManifestEntry[] {
  return parseManifest(readFileSync(path, "utf-8"));
}
