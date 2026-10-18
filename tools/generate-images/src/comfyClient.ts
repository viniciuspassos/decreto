import type { ApiWorkflow } from "./types.js";

export interface OutputImage {
  filename: string;
  subfolder: string;
  type: string;
}

interface QueueResponse {
  prompt_id: string;
}

type HistoryResponse = Record<string, { outputs?: Record<string, { images?: OutputImage[] }> }>;

/** Envia o workflow para a fila do ComfyUI e retorna o id do prompt. */
export async function queuePrompt(baseUrl: string, workflow: ApiWorkflow): Promise<string> {
  const response = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: crypto.randomUUID() }),
  });

  if (!response.ok) {
    throw new Error(`ComfyUI recusou o prompt: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as QueueResponse;
  return data.prompt_id;
}

/** Espera o prompt terminar e retorna as imagens produzidas (poll em /history). */
export async function pollForOutputImages(
  baseUrl: string,
  promptId: string,
  options: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<OutputImage[]> {
  const intervalMs = options.intervalMs ?? 2000;
  const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const images = await fetchHistoryOutputImages(baseUrl, promptId);
    if (images) {
      return images;
    }
    await sleep(intervalMs);
  }

  throw new Error(`tempo esgotado esperando o prompt ${promptId}`);
}

async function fetchHistoryOutputImages(
  baseUrl: string,
  promptId: string,
): Promise<OutputImage[] | null> {
  const response = await fetch(`${baseUrl}/history/${promptId}`);
  if (!response.ok) {
    throw new Error(`ComfyUI recusou /history: ${response.status}`);
  }

  const history = (await response.json()) as HistoryResponse;
  const entry = history[promptId];
  if (!entry) {
    return null;
  }

  const images = Object.values(entry.outputs ?? {}).flatMap((output) => output.images ?? []);
  return images.length > 0 ? images : null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Baixa os bytes de uma imagem de saída já gerada pelo ComfyUI. */
export async function downloadImage(baseUrl: string, image: OutputImage): Promise<Buffer> {
  const query = new URLSearchParams({
    filename: image.filename,
    subfolder: image.subfolder,
    type: image.type,
  });

  const response = await fetch(`${baseUrl}/view?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`ComfyUI recusou /view: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
