import { loadManifest } from "./manifest.js";
import { loadBaseWorkflow, runBatch } from "./runBatch.js";
import { loadTrailerClipEntries } from "./trailerManifest.js";

export interface CliArgs {
  manifestPath: string;
  basePath: string;
  imagesDir: string;
  comfyUrl: string;
  force: boolean;
  only?: string;
  extension?: string;
  timeoutMin?: number;
  trailerManifestPath?: string;
  sharedManifestPath?: string;
}

const DEFAULTS = {
  manifestPath: "assets/prompts/manifest.json",
  basePath: "assets/prompts/_base.api.json",
  imagesDir: "assets/images",
};

type StringField =
  | "only"
  | "manifestPath"
  | "basePath"
  | "imagesDir"
  | "comfyUrl"
  | "extension"
  | "timeoutMin"
  | "trailerManifestPath"
  | "sharedManifestPath";

const VALUE_FLAGS: Record<string, StringField> = {
  "--only": "only",
  "--manifest": "manifestPath",
  "--base": "basePath",
  "--images-dir": "imagesDir",
  "--comfy-url": "comfyUrl",
  "--ext": "extension",
  "--timeout-min": "timeoutMin",
  "--trailer": "trailerManifestPath",
  "--shared-manifest": "sharedManifestPath",
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

/**
 * Reads command-line flags (--manifest, --base, --images-dir, --comfy-url, --force, --only,
 * --ext, --timeout-min, --trailer, --shared-manifest).
 */
export function parseArgs(argv: string[]): CliArgs {
  const { values, force } = collectFlags(argv);

  return {
    manifestPath: values.manifestPath ?? DEFAULTS.manifestPath,
    basePath: values.basePath ?? DEFAULTS.basePath,
    imagesDir: values.imagesDir ?? DEFAULTS.imagesDir,
    comfyUrl: values.comfyUrl ?? process.env.COMFYUI_URL ?? "http://127.0.0.1:8188",
    force,
    only: values.only,
    extension: values.extension,
    timeoutMin: parseTimeoutMin(values.timeoutMin),
    trailerManifestPath: values.trailerManifestPath,
    sharedManifestPath: values.sharedManifestPath,
  };
}

function parseTimeoutMin(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw new Error(`--timeout-min must be a number of minutes greater than zero (received: "${value}")`);
  }
  return minutes;
}

/**
 * Runs the full batch from CLI arguments and prints each entry as soon as it completes.
 * With `--trailer`, reads the trailer's ordered manifest ("clip" plans, resolving "shared" plans in
 * `shared.manifest.json`); otherwise, reads the "workbench" manifest specified by `--manifest`.
 */
export async function run(argv: string[]): Promise<void> {
  const args = parseArgs(argv);
  const base = loadBaseWorkflow(args.basePath);
  const entries = args.trailerManifestPath
    ? loadTrailerClipEntries(args.trailerManifestPath, args.sharedManifestPath)
    : loadManifest(args.manifestPath);

  await runBatch(base, entries, {
    comfyUrl: args.comfyUrl,
    imagesDir: args.imagesDir,
    force: args.force,
    only: args.only,
    extension: args.extension,
    timeoutMs: args.timeoutMin === undefined ? undefined : args.timeoutMin * 60 * 1000,
    onResult: (result) => {
      const time = new Date().toLocaleTimeString("en-US");
      console.log(`${time} [${result.status}] ${result.category}/${result.name} -> ${result.destination}`);
    },
  });
}
