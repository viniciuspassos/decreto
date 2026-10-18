import type { ApiWorkflow, ManifestEntry } from "./types.js";

const POSITIVE_PROMPT_NODE = "2";
const SEED_NODE = "5";
const SAVE_IMAGE_NODE = "7";

/** Deriva o workflow de uma entrada do manifest a partir do template base (prompt/seed/destino). */
export function buildWorkflowForEntry(base: ApiWorkflow, entry: ManifestEntry): ApiWorkflow {
  const workflow: ApiWorkflow = structuredClone(base);

  requireNode(workflow, POSITIVE_PROMPT_NODE).inputs.text = entry.prompt;
  if (entry.seed !== undefined) {
    const sampler = requireNode(workflow, SEED_NODE);
    // KSampler usa "seed"; KSamplerAdvanced (workflows de vídeo em duas fases) usa "noise_seed".
    sampler.inputs["noise_seed" in sampler.inputs ? "noise_seed" : "seed"] = entry.seed;
  }
  requireNode(workflow, SAVE_IMAGE_NODE).inputs.filename_prefix = `decreto/${entry.category}/${entry.name}`;

  return workflow;
}

function requireNode(workflow: ApiWorkflow, nodeId: string) {
  const node = workflow[nodeId];
  if (!node) {
    throw new Error(`workflow base não tem o nó "${nodeId}"`);
  }
  return node;
}
