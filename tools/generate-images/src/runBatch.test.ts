import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

const queuePromptMock = jest.fn<(baseUrl: string, workflow: unknown) => Promise<string>>();
const pollForOutputImagesMock =
  jest.fn<(baseUrl: string, promptId: string) => Promise<{ filename: string; subfolder: string; type: string }[]>>();
const downloadImageMock = jest.fn<(baseUrl: string, image: unknown) => Promise<Buffer>>();

jest.unstable_mockModule("./comfyClient.js", () => ({
  queuePrompt: queuePromptMock,
  pollForOutputImages: pollForOutputImagesMock,
  downloadImage: downloadImageMock,
}));

const { runBatch, loadBaseWorkflow } = await import("./runBatch.js");

const BASE_WORKFLOW = {
  "2": { class_type: "CLIPTextEncode", inputs: { text: "{{PROMPT}}" } },
  "5": { class_type: "KSampler", inputs: { seed: 42 } },
  "7": { class_type: "SaveImage", inputs: { filename_prefix: "decreto/_base" } },
};

describe("runBatch", () => {
  let imagesDir: string;

  beforeEach(() => {
    imagesDir = mkdtempSync(join(tmpdir(), "decreto-images-"));
    queuePromptMock.mockReset().mockResolvedValue("prompt-1");
    pollForOutputImagesMock
      .mockReset()
      .mockResolvedValue([{ filename: "out.png", subfolder: "decreto", type: "output" }]);
    downloadImageMock.mockReset().mockResolvedValue(Buffer.from("fake-png"));
  });

  afterEach(() => {
    rmSync(imagesDir, { recursive: true, force: true });
  });

  it("generates the image and saves it to the expected destination", async () => {
    const results = await runBatch(
      BASE_WORKFLOW,
      [{ category: "events", name: "coup", prompt: "tanks" }],
      { comfyUrl: "http://localhost:8188", imagesDir },
    );

    const destination = join(imagesDir, "events", "coup.png");
    expect(results).toEqual([
      { name: "coup", category: "events", status: "generated", destination },
    ]);
    expect(readFileSync(destination, "utf-8")).toBe("fake-png");
    expect(queuePromptMock).toHaveBeenCalledTimes(1);
  });

  it("uses the specified extension and reports each completed entry", async () => {
    const onResult = jest.fn();

    const results = await runBatch(
      BASE_WORKFLOW,
      [{ category: "trailer", name: "a2", prompt: "hands" }],
      { comfyUrl: "http://localhost:8188", imagesDir, extension: "mp4", timeoutMs: 60_000, onResult },
    );

    expect(results[0]?.destination).toBe(join(imagesDir, "trailer", "a2.mp4"));
    expect(pollForOutputImagesMock).toHaveBeenCalledWith("http://localhost:8188", "prompt-1", {
      timeoutMs: 60_000,
    });
    expect(onResult).toHaveBeenCalledWith(results[0]);
  });

  it("skips previously generated entries when force is not passed", async () => {
    const { mkdirSync } = await import("node:fs");
    const destination = join(imagesDir, "events", "coup.png");
    mkdirSync(join(imagesDir, "events"), { recursive: true });
    writeFileSync(destination, "ja existe");

    const results = await runBatch(
      BASE_WORKFLOW,
      [{ category: "events", name: "coup", prompt: "tanks" }],
      { comfyUrl: "http://localhost:8188", imagesDir },
    );

    expect(results).toEqual([
      { name: "coup", category: "events", status: "skipped", destination },
    ]);
    expect(queuePromptMock).not.toHaveBeenCalled();
  });

  it("regenerates existing entries when force is passed", async () => {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(join(imagesDir, "events"), { recursive: true });
    writeFileSync(join(imagesDir, "events", "coup.png"), "old");

    const results = await runBatch(
      BASE_WORKFLOW,
      [{ category: "events", name: "coup", prompt: "tanks" }],
      { comfyUrl: "http://localhost:8188", imagesDir, force: true },
    );

    expect(results[0]?.status).toBe("generated");
    expect(queuePromptMock).toHaveBeenCalledTimes(1);
  });

  it("filters by name when only is passed", async () => {
    const results = await runBatch(
      BASE_WORKFLOW,
      [
        { category: "events", name: "a", prompt: "x" },
        { category: "events", name: "b", prompt: "y" },
      ],
      { comfyUrl: "http://localhost:8188", imagesDir, only: "b" },
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("b");
  });

  it("throws when ComfyUI returns no images", async () => {
    pollForOutputImagesMock.mockResolvedValue([]);

    await expect(
      runBatch(BASE_WORKFLOW, [{ category: "events", name: "a", prompt: "x" }], {
        comfyUrl: "http://localhost:8188",
        imagesDir,
      }),
    ).rejects.toThrow("returned no image");
  });

  it("loadBaseWorkflow reads and parses the base template from disk", () => {
    const basePath = join(imagesDir, "base.json");
    writeFileSync(basePath, JSON.stringify(BASE_WORKFLOW));

    expect(loadBaseWorkflow(basePath)).toEqual(BASE_WORKFLOW);
  });
});
