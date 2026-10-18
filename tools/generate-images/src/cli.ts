import { loadManifest } from "./manifest.js";
import { loadBaseWorkflow, runBatch } from "./runBatch.js";

export interface CliArgs {
  manifestPath: string;
  basePath: string;
  imagesDir: string;
  comfyUrl: string;
  force: boolean;
  only?: string;
}

const DEFAULTS = {
  manifestPath: "assets/prompts/manifest.json",
  basePath: "assets/prompts/_base.api.json",
  imagesDir: "assets/images",
};

type StringField = "only" | "manifestPath" | "basePath" | "imagesDir" | "comfyUrl";

const VALUE_FLAGS: Record<string, StringField> = {
  "--only": "only",
  "--manifest": "manifestPath",
  "--base": "basePath",
  "--images-dir": "imagesDir",
  "--comfy-url": "comfyUrl",
};

interface ParsedFlags {
  values: Partial<Record<StringField, string>>;
  force: boolean;
}

function collectFlags(argv: string[]): ParsedFlags {
  const values: Partial<Record<StringField, string>> = {};
  let force = false;

  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--force") {
      force = true;
      continue;
    }

    const field = flag ? VALUE_FLAGS[flag] : undefined;
    const value = field ? argv[++i] : undefined;
    if (field && value !== undefined) {
      values[field] = value;
    }
  }

  return { values, force };
}

/** Lê flags de linha de comando (--manifest, --base, --images-dir, --comfy-url, --force, --only). */
export function parseArgs(argv: string[]): CliArgs {
  const { values, force } = collectFlags(argv);

  return {
    manifestPath: values.manifestPath ?? DEFAULTS.manifestPath,
    basePath: values.basePath ?? DEFAULTS.basePath,
    imagesDir: values.imagesDir ?? DEFAULTS.imagesDir,
    comfyUrl: values.comfyUrl ?? process.env.COMFYUI_URL ?? "http://127.0.0.1:8188",
    force,
    only: values.only,
  };
}

/** Roda o lote completo a partir dos argumentos de CLI e imprime um resumo. */
export async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const base = loadBaseWorkflow(args.basePath);
  const entries = loadManifest(args.manifestPath);

  const results = await runBatch(base, entries, {
    comfyUrl: args.comfyUrl,
    imagesDir: args.imagesDir,
    force: args.force,
    only: args.only,
  });

  for (const result of results) {
    console.log(`[${result.status}] ${result.category}/${result.name} -> ${result.destination}`);
  }
}
