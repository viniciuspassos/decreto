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
      "--force",
    ]);

    expect(args).toEqual({
      manifestPath: "m.json",
      basePath: "b.json",
      imagesDir: "out",
      comfyUrl: "http://x:1",
      only: "golpe-militar",
      force: true,
    });
  });
});

describe("run", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("carrega base/manifest, roda o lote e imprime o resumo", async () => {
    loadBaseWorkflowMock.mockReturnValue({});
    loadManifestMock.mockReturnValue([{ category: "eventos", name: "a", prompt: "x" }]);
    runBatchMock.mockResolvedValue([
      { name: "a", category: "eventos", status: "generated", destination: "assets/images/eventos/a.png" },
    ]);
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await run(["--only", "a"]);

    expect(runBatchMock).toHaveBeenCalledWith(
      {},
      [{ category: "eventos", name: "a", prompt: "x" }],
      expect.objectContaining({ only: "a" }),
    );
    expect(logSpy).toHaveBeenCalledWith(
      "[generated] eventos/a -> assets/images/eventos/a.png",
    );
  });
});
