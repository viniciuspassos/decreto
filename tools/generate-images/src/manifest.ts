import { readFileSync } from "node:fs";
import type { ManifestEntry } from "./types.js";

const NAME_PATTERN = /^[a-z0-9-]+$/;

/** Valida e normaliza o conteúdo bruto do manifest (array de entradas). */
export function parseManifest(raw: string): ManifestEntry[] {
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("manifest deve ser um array de entradas");
  }
  return data.map((entry, index) => validateEntry(entry, index));
}

function validateEntry(entry: unknown, index: number): ManifestEntry {
  if (typeof entry !== "object" || entry === null) {
    throw new Error(`entrada ${index} inválida: não é um objeto`);
  }

  const { category, name, prompt, seed } = entry as Record<string, unknown>;
  requireSlug(category, index, "category");
  requireSlug(name, index, "name");

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error(`entrada ${index}: "prompt" vazio`);
  }
  if (seed !== undefined && typeof seed !== "number") {
    throw new Error(`entrada ${index}: "seed" deve ser número`);
  }

  return { category: category as string, name: name as string, prompt, seed };
}

function requireSlug(value: unknown, index: number, field: string): void {
  if (typeof value !== "string" || !NAME_PATTERN.test(value)) {
    throw new Error(`entrada ${index}: "${field}" deve ser minúsculo, só letras/números/hífen`);
  }
}

export function loadManifest(path: string): ManifestEntry[] {
  return parseManifest(readFileSync(path, "utf-8"));
}
