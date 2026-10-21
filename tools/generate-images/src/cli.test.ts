import { afterEach, describe, expect, it, jest } from "@jest/globals";
import type { ManifestEntry } from "./types.js";
import type { RunBatchResult } from "./runBatch.js";

const loadBaseWorkflowMock = jest.fn<(path: string) => Record<string, unknown>>();
const runBatchMock = jest.fn<(...args: unknown[]) => Promise<RunBatchResult[]>>();
const loadManifestMock = jest.fn<(path: string) => ManifestEntry[]>();
const loadTrailerClipEntriesMock = jest.fn<(trailerPath: string, sharedPath?: string) => ManifestEntry[]>();

jest.unstable_mockModule("./runBatch.js", () => ({
  loadBaseWorkflow: loadBaseWorkflowMock,
  runBatch: runBatchMock,
}));
jest.unstable_mockModule("./manifest.js", () => ({
  loadManifest: loadManifestMock,
}));
jest.unstable_mockModule("./trailerManifest.js", () => ({
  loadTrailerClipEntries: loadTrailerClipEntriesMock,
}));

const { parseArgs, run } = await import("./cli.js");

describe("parseArgs", () => {
  it("uses default values when no flags are passed", () => {
    const args = parseArgs([]);
    expect(args).toEqual({
      manifestPath: "assets/prompts/manifest.json",
      basePath: "assets/prompts/_base.api.json",
      imagesDir: "assets/images",
      comfyUrl: "http://127.0.0.1:8188",
      force: false,
    });
  });

  it("reads all supported flags", () => {
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
      "coup",
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
      only: "coup",
      extension: "mp4",
      timeoutMin: 60,
      force: true,
    });
  });

  it.each(["abc", "0", "-5"])("rejects invalid --timeout-min (%s)", (value) => {
    expect(() => parseArgs(["--timeout-min", value])).toThrow("--timeout-min must be a number of minutes greater than zero");
  });

  it("reads --trailer and --shared-manifest", () => {
    const args = parseArgs(["--trailer", "assets/trailers/1-mandato.manifest.json", "--shared-manifest", "c.json"]);

    expect(args.trailerManifestPath).toBe("assets/trailers/1-mandato.manifest.json");
    expect(args.sharedManifestPath).toBe("c.json");
  });
});

describe("run", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("loads base/manifest, runs the batch, and prints each completed entry", async () => {
    const result: RunBatchResult = {
      name: "a",
      category: "events",
      status: "generated",
      destination: "assets/images/events/a.png",
    };
    loadBaseWorkflowMock.mockReturnValue({});
    loadManifestMock.mockReturnValue([{ category: "events", name: "a", prompt: "x" }]);
    runBatchMock.mockImplementation(async (...args: unknown[]) => {
      (args[2] as { onResult: (r: RunBatchResult) => void }).onResult(result);
      return [result];
    });
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

    await run(["--only", "a", "--timeout-min", "60"]);

    expect(runBatchMock).toHaveBeenCalledWith(
      {},
      [{ category: "events", name: "a", prompt: "x" }],
      expect.objectContaining({ only: "a", timeoutMs: 3_600_000 }),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/ \[generated\] events\/a -> assets\/images\/events\/a\.png$/),
    );
  });

  it("uses the trailer manifest when --trailer is passed instead of the workbench manifest", async () => {
    loadBaseWorkflowMock.mockReturnValue({});
    loadTrailerClipEntriesMock.mockReturnValue([{ category: "1-mandato", name: "1-01-s42", prompt: "x" }]);
    runBatchMock.mockResolvedValue([]);

    await run(["--trailer", "assets/trailers/1-mandato.manifest.json", "--shared-manifest", "c.json"]);

    expect(loadTrailerClipEntriesMock).toHaveBeenCalledWith("assets/trailers/1-mandato.manifest.json", "c.json");
    expect(loadManifestMock).not.toHaveBeenCalled();
    expect(runBatchMock).toHaveBeenCalledWith(
      {},
      [{ category: "1-mandato", name: "1-01-s42", prompt: "x" }],
      expect.anything(),
    );
  });
});
