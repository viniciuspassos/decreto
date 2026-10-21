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
  /** Saved file extension (default "png"; "mp4" for video clips). */
  extension?: string;
  /** Maximum wait time per entry (comfyClient default: 5 min). */
  timeoutMs?: number;
  /** Called after each completed entry to track long batches. */
  onResult?: (result: RunBatchResult) => void;
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

/** Generates one image per manifest entry in sequence (ComfyUI runs one job at a time). */
export async function runBatch(
  base: ApiWorkflow,
  entries: ManifestEntry[],
  options: RunBatchOptions,
): Promise<RunBatchResult[]> {
  const selected = options.only ? entries.filter((entry) => entry.name === options.only) : entries;

  const results: RunBatchResult[] = [];
  for (const entry of selected) {
    const result = await runEntry(base, entry, options);
    options.onResult?.(result);
    results.push(result);
  }
  return results;
}

async function runEntry(
  base: ApiWorkflow,
  entry: ManifestEntry,
  options: RunBatchOptions,
): Promise<RunBatchResult> {
  const destination = join(options.imagesDir, entry.category, `${entry.name}.${options.extension ?? "png"}`);

  if (!options.force && existsSync(destination)) {
    return { name: entry.name, category: entry.category, status: "skipped", destination };
  }

  const workflow = buildWorkflowForEntry(base, entry);
  const promptId = await queuePrompt(options.comfyUrl, workflow);
  const [image] = await pollForOutputImages(options.comfyUrl, promptId, {
    timeoutMs: options.timeoutMs,
  });
  if (!image) {
    throw new Error(`ComfyUI returned no image for "${entry.name}"`);
  }
  const bytes = await downloadImage(options.comfyUrl, image);

  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, bytes);

  return { name: entry.name, category: entry.category, status: "generated", destination };
}
