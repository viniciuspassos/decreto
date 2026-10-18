import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { buildWorkflowForEntry } from "./buildWorkflow.js";
import { downloadImage, pollForOutputImages, queuePrompt } from "./comfyClient.js";
import type { ApiWorkflow, ManifestEntry } from "./types.js";

export interface RunBatchOptions {
  comfyUrl: string;
  imagesDir: string;
  force?: boolean;
  only?: string;
}

export interface RunBatchResult {
  name: string;
  category: string;
  status: "generated" | "skipped";
  destination: string;
}

export function loadBaseWorkflow(path: string): ApiWorkflow {
  return JSON.parse(readFileSync(path, "utf-8")) as ApiWorkflow;
}

/** Gera, em sequência, uma imagem por entrada do manifest (ComfyUI roda um job por vez). */
export async function runBatch(
  base: ApiWorkflow,
  entries: ManifestEntry[],
  options: RunBatchOptions,
): Promise<RunBatchResult[]> {
  const selected = options.only ? entries.filter((entry) => entry.name === options.only) : entries;

  const results: RunBatchResult[] = [];
  for (const entry of selected) {
    results.push(await runEntry(base, entry, options));
  }
  return results;
}

async function runEntry(
  base: ApiWorkflow,
  entry: ManifestEntry,
  options: RunBatchOptions,
): Promise<RunBatchResult> {
  const destination = join(options.imagesDir, entry.category, `${entry.name}.png`);

  if (!options.force && existsSync(destination)) {
    return { name: entry.name, category: entry.category, status: "skipped", destination };
  }

  const workflow = buildWorkflowForEntry(base, entry);
  const promptId = await queuePrompt(options.comfyUrl, workflow);
  const [image] = await pollForOutputImages(options.comfyUrl, promptId);
  if (!image) {
    throw new Error(`ComfyUI não retornou imagem para "${entry.name}"`);
  }
  const bytes = await downloadImage(options.comfyUrl, image);

  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, bytes);

  return { name: entry.name, category: entry.category, status: "generated", destination };
}
