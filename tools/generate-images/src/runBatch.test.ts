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

  it("gera a imagem e grava no destino esperado", async () => {
    const results = await runBatch(
      BASE_WORKFLOW,
      [{ category: "eventos", name: "golpe-militar", prompt: "tanks" }],
      { comfyUrl: "http://localhost:8188", imagesDir },
    );

    const destination = join(imagesDir, "eventos", "golpe-militar.png");
    expect(results).toEqual([
      { name: "golpe-militar", category: "eventos", status: "generated", destination },
    ]);
    expect(readFileSync(destination, "utf-8")).toBe("fake-png");
    expect(queuePromptMock).toHaveBeenCalledTimes(1);
  });

  it("usa a extensão e o timeout informados e avisa cada entrada concluída", async () => {
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

  it("pula entradas já geradas quando force não é passado", async () => {
    const { mkdirSync } = await import("node:fs");
    const destination = join(imagesDir, "eventos", "golpe-militar.png");
    mkdirSync(join(imagesDir, "eventos"), { recursive: true });
    writeFileSync(destination, "ja existe");

    const results = await runBatch(
      BASE_WORKFLOW,
      [{ category: "eventos", name: "golpe-militar", prompt: "tanks" }],
      { comfyUrl: "http://localhost:8188", imagesDir },
    );

    expect(results).toEqual([
      { name: "golpe-militar", category: "eventos", status: "skipped", destination },
    ]);
    expect(queuePromptMock).not.toHaveBeenCalled();
  });

  it("regenera entradas existentes quando force é passado", async () => {
    const { mkdirSync } = await import("node:fs");
    mkdirSync(join(imagesDir, "eventos"), { recursive: true });
    writeFileSync(join(imagesDir, "eventos", "golpe-militar.png"), "antiga");

    const results = await runBatch(
      BASE_WORKFLOW,
      [{ category: "eventos", name: "golpe-militar", prompt: "tanks" }],
      { comfyUrl: "http://localhost:8188", imagesDir, force: true },
    );

    expect(results[0]?.status).toBe("generated");
    expect(queuePromptMock).toHaveBeenCalledTimes(1);
  });

  it("filtra pelo nome quando only é passado", async () => {
    const results = await runBatch(
      BASE_WORKFLOW,
      [
        { category: "eventos", name: "a", prompt: "x" },
        { category: "eventos", name: "b", prompt: "y" },
      ],
      { comfyUrl: "http://localhost:8188", imagesDir, only: "b" },
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("b");
  });

  it("lança erro quando o ComfyUI não retorna nenhuma imagem", async () => {
    pollForOutputImagesMock.mockResolvedValue([]);

    await expect(
      runBatch(BASE_WORKFLOW, [{ category: "eventos", name: "a", prompt: "x" }], {
        comfyUrl: "http://localhost:8188",
        imagesDir,
      }),
    ).rejects.toThrow("não retornou imagem");
  });

  it("loadBaseWorkflow lê e parseia o template base do disco", () => {
    const basePath = join(imagesDir, "base.json");
    writeFileSync(basePath, JSON.stringify(BASE_WORKFLOW));

    expect(loadBaseWorkflow(basePath)).toEqual(BASE_WORKFLOW);
  });
});
