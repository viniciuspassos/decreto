import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { ManifestEntry } from "./types.js";
import type { RunBatchResult } from "./runBatch.js";

const loadBaseWorkflowMock = jest.fn<(path: string) => Record<string, unknown>>();
const runBatchMock = jest.fn<(...args: unknown[]) => Promise<RunBatchResult[]>>();
const loadManifestMock = jest.fn<(path: string) => ManifestEntry[]>();

jest.unstable_mockModule("./runBatch.js", () => ({
  loadBaseWorkflow: loadBaseWorkflowMock,
  runBatch: runBatchMock,
}));
jest.unstable_mockModule("./manifest.js", () => ({
  loadManifest: loadManifestMock,
}));

const { parseArgs, run } = await import("./cli.js");

describe("parseArgs", () => {
  it("usa os valores padrão quando nenhuma flag é passada", () => {
    const args = parseArgs([]);
    expect(args).toEqual({
      manifestPath: "assets/prompts/manifest.json",
      basePath: "assets/prompts/_base.api.json",
      imagesDir: "assets/images",
      comfyUrl: "http://127.0.0.1:8188",
      force: false,
    });
  });

  it("lê todas as flags suportadas", () => {
    const args = parseArgs([
      "--manifest",
      "m.json",
      "--base",
      "b.json",
      "--images-dir",
      "out",
      "--comfy-url",
      "http://x:1",
      "--only",
      "golpe-militar",
      "--ext",
      "mp4",
      "--timeout-min",
      "60",
      "--force",
    ]);

    expect(args).toEqual({
      manifestPath: "m.json",
      basePath: "b.json",
      imagesDir: "out",
      comfyUrl: "http://x:1",
      only: "golpe-militar",
      extension: "mp4",
      timeoutMin: 60,
      force: true,
    });
  });

  it.each(["abc", "0", "-5"])("rejeita --timeout-min inválido (%s)", (value) => {
    expect(() => parseArgs(["--timeout-min", value])).toThrow("--timeout-min deve ser um número");
  });
});

describe("run", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("carrega base/manifest, roda o lote e imprime cada entrada concluída", async () => {
    const result: RunBatchResult = {
      name: "a",
      category: "eventos",
      status: "generated",
      destination: "assets/images/eventos/a.png",
    };
    loadBaseWorkflowMock.mockReturnValue({});
    loadManifestMock.mockReturnValue([{ category: "eventos", name: "a", prompt: "x" }]);
    runBatchMock.mockImplementation(async (...args: unknown[]) => {
      (args[2] as { onResult: (r: RunBatchResult) => void }).onResult(result);
      return [result];
    });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await run(["--only", "a", "--timeout-min", "60"]);

    expect(runBatchMock).toHaveBeenCalledWith(
      {},
      [{ category: "eventos", name: "a", prompt: "x" }],
      expect.objectContaining({ only: "a", timeoutMs: 3_600_000 }),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/ \[generated\] eventos\/a -> assets\/images\/eventos\/a\.png$/),
    );
  });
});
