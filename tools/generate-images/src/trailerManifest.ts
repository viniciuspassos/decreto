import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ManifestEntry, TrailerManifest, TrailerPlan } from "./types.js";

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const DEFAULT_SEED = 42;
const COMUM_FILENAME = "comum.manifest.json";

/** Valida e normaliza o manifest de um trailer ({ trailer, plans }). */
export function parseTrailerManifest(raw: string): TrailerManifest {
  const data = JSON.parse(raw) as Record<string, unknown>;
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error('manifest de trailer deve ser um objeto com "trailer" e "plans"');
  }

  const { trailer, plans } = data;
  if (typeof trailer !== "string" || !SLUG_PATTERN.test(trailer)) {
    throw new Error('"trailer" deve ser minúsculo, só letras/números/hífen');
  }
  if (!Array.isArray(plans)) {
    throw new Error('"plans" deve ser um array');
  }

  return { trailer, plans: plans.map(validatePlan) };
}

function validatePlan(plan: unknown): TrailerPlan {
  if (typeof plan !== "object" || plan === null) {
    throw new Error("plano inválido: não é um objeto");
  }

  const { id, shared, kind, prompt, seed } = plan as Record<string, unknown>;
  if (typeof id !== "string" || !SLUG_PATTERN.test(id)) {
    throw new Error('plano inválido: "id" deve ser minúsculo, só letras/números/hífen');
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
  throw new Error(`plano "${id}": "kind" inválido (${String(kind)})`);
}

function requirePrompt(id: string, prompt: unknown): string {
  if (typeof prompt !== "string") {
    throw new Error(`plano "${id}": "prompt" é obrigatório em planos "clip" (pode ser "" se pendente)`);
  }
  return prompt;
}

function requireOptionalSeed(id: string, seed: unknown): number | undefined {
  if (seed !== undefined && typeof seed !== "number") {
    throw new Error(`plano "${id}": "seed" deve ser número`);
  }
  return seed;
}

export function loadTrailerManifest(path: string): TrailerManifest {
  return parseTrailerManifest(readFileSync(path, "utf-8"));
}

/**
 * Resolve os planos "clip" de um trailer em entradas prontas para o lote de geração: planos
 * `shared: true` são buscados em `comumManifest` (category "comum"), e planos com prompt ainda
 * vazio (pendentes) ou que não são "clip" (screen/image/black) são ignorados.
 */
export function resolveTrailerClipEntries(
  trailerManifest: TrailerManifest,
  comumManifest: TrailerManifest | undefined,
  comumManifestPath: string = COMUM_FILENAME,
): ManifestEntry[] {
  const entries: ManifestEntry[] = [];
  for (const plan of trailerManifest.plans) {
    const entry = "shared" in plan
      ? resolveSharedPlan(plan.id, comumManifest, comumManifestPath)
      : clipEntryFromPlan(trailerManifest.trailer, plan);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

function resolveSharedPlan(
  id: string,
  comumManifest: TrailerManifest | undefined,
  comumManifestPath: string,
): ManifestEntry | undefined {
  const shared = comumManifest?.plans.find((plan) => plan.id === id);
  if (!shared) {
    throw new Error(`plano compartilhado "${id}" não encontrado em ${comumManifestPath}`);
  }
  if ("shared" in shared) {
    throw new Error(`plano compartilhado "${id}" não pode apontar para outro plano shared`);
  }
  return clipEntryFromPlan("comum", shared);
}

function clipEntryFromPlan(category: string, plan: Exclude<TrailerPlan, { shared: true }>): ManifestEntry | undefined {
  if (plan.kind !== "clip" || plan.prompt.trim().length === 0) {
    return undefined;
  }
  const seed = plan.seed ?? DEFAULT_SEED;
  return { category, name: `${plan.id}-s${seed}`, prompt: plan.prompt, seed };
}

/** Carrega o manifest de um trailer e resolve seus clipes, buscando comum.manifest.json ao lado dele. */
export function loadTrailerClipEntries(trailerManifestPath: string, comumManifestPath?: string): ManifestEntry[] {
  const trailerManifest = loadTrailerManifest(trailerManifestPath);
  const resolvedComumPath = comumManifestPath ?? join(dirname(trailerManifestPath), COMUM_FILENAME);
  const comumManifest = existsSync(resolvedComumPath) ? loadTrailerManifest(resolvedComumPath) : undefined;
  return resolveTrailerClipEntries(trailerManifest, comumManifest, resolvedComumPath);
}
