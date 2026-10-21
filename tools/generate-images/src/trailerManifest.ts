import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ManifestEntry, TrailerManifest, TrailerPlan } from "./types.js";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const DEFAULT_SEED = 42;
const SHARED_MANIFEST_FILENAME = "shared.manifest.json";

/** Validates and normalizes a trailer manifest ({ trailer, plans }). */
export function parseTrailerManifest(raw: string): TrailerManifest {
  const data = JSON.parse(raw) as Record<string, unknown>;
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error('trailer manifest must be an object with "trailer" and "plans"');
  }

  const { trailer, plans } = data;
  if (typeof trailer !== "string" || !SLUG_PATTERN.test(trailer)) {
    throw new Error('"trailer" must be lowercase and contain only letters, numbers, or hyphens');
  }
  if (!Array.isArray(plans)) {
    throw new Error('"plans" must be an array');
  }

  return { trailer, plans: plans.map(validatePlan) };
}

function validatePlan(plan: unknown): TrailerPlan {
  if (typeof plan !== "object" || plan === null) {
    throw new Error("invalid plan: expected an object");
  }

  const { id, shared, kind, prompt, seed } = plan as Record<string, unknown>;
  if (typeof id !== "string" || !SLUG_PATTERN.test(id)) {
    throw new Error('invalid plan: "id" must be lowercase and contain only letters, numbers, or hyphens');
  }
  if (shared === true) {
    return { id, shared: true };
  }
  if (kind === "clip") {
    return { id, kind: "clip", prompt: requirePrompt(id, prompt), seed: requireOptionalSeed(id, seed) };
  }
  if (kind === "screen" || kind === "image" || kind === "black") {
    return { id, kind };
  }
  throw new Error(`plan "${id}": invalid "kind" (${String(kind)})`);
}

function requirePrompt(id: string, prompt: unknown): string {
  if (typeof prompt !== "string") {
    throw new Error(`plan "${id}": "prompt" is required for "clip" plans (may be "" if pending)`);
  }
  return prompt;
}

function requireOptionalSeed(id: string, seed: unknown): number | undefined {
  if (seed !== undefined && typeof seed !== "number") {
    throw new Error(`plan "${id}": "seed" must be a number`);
  }
  return seed;
}

export function loadTrailerManifest(path: string): TrailerManifest {
  return parseTrailerManifest(readFileSync(path, "utf-8"));
}

/**
 * Resolves a trailer's "clip" plans into entries ready for the generation batch: plans
 * with `shared: true` are looked up in `sharedManifest` (category "shared"), and plans with an
 * empty prompt (pending) or that are not "clip" (screen/image/black) are ignored.
 */
export function resolveTrailerClipEntries(
  trailerManifest: TrailerManifest,
  sharedManifest: TrailerManifest | undefined,
  sharedManifestPath: string = SHARED_MANIFEST_FILENAME,
): ManifestEntry[] {
  const entries: ManifestEntry[] = [];
  for (const plan of trailerManifest.plans) {
    const entry = "shared" in plan
      ? resolveSharedPlan(plan.id, sharedManifest, sharedManifestPath)
      : clipEntryFromPlan(trailerManifest.trailer, plan);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

function resolveSharedPlan(
  id: string,
  sharedManifest: TrailerManifest | undefined,
  sharedManifestPath: string,
): ManifestEntry | undefined {
  const shared = sharedManifest?.plans.find((plan) => plan.id === id);
  if (!shared) {
    throw new Error(`shared plan "${id}" not found in ${sharedManifestPath}`);
  }
  if ("shared" in shared) {
    throw new Error(`shared plan "${id}" cannot point to another shared plan`);
  }
  return clipEntryFromPlan("shared", shared);
}

function clipEntryFromPlan(category: string, plan: Exclude<TrailerPlan, { shared: true }>): ManifestEntry | undefined {
  if (plan.kind !== "clip" || plan.prompt.trim().length === 0) {
    return undefined;
  }
  const seed = plan.seed ?? DEFAULT_SEED;
  return { category, name: `${plan.id}-s${seed}`, prompt: plan.prompt, seed };
}

/** Loads a trailer manifest and resolves its clips, looking for `shared.manifest.json` beside it. */
export function loadTrailerClipEntries(trailerManifestPath: string, sharedManifestPath?: string): ManifestEntry[] {
  const trailerManifest = loadTrailerManifest(trailerManifestPath);
  const resolvedSharedPath = sharedManifestPath ?? join(dirname(trailerManifestPath), SHARED_MANIFEST_FILENAME);
  const sharedManifest = existsSync(resolvedSharedPath) ? loadTrailerManifest(resolvedSharedPath) : undefined;
  return resolveTrailerClipEntries(trailerManifest, sharedManifest, resolvedSharedPath);
}
