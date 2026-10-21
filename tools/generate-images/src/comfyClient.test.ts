import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { downloadImage, pollForOutputImages, queuePrompt } from "./comfyClient.js";

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe("comfyClient", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("queuePrompt returns the queued prompt_id", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ prompt_id: "abc123" }));

    const promptId = await queuePrompt("http://localhost:8188", {});

    expect(promptId).toBe("abc123");
  });

  it("queuePrompt throws when ComfyUI rejects the request", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ error: "bad" }, false, 400));

    await expect(queuePrompt("http://localhost:8188", {})).rejects.toThrow(
      "ComfyUI rejected the prompt",
    );
  });

  it("pollForOutputImages waits for the history to become available", async () => {
    const images = [{ filename: "a.png", subfolder: "decreto", type: "output" }];
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({ p1: { outputs: { "7": { images } } } }));

    const result = await pollForOutputImages("http://localhost:8188", "p1", { intervalMs: 1 });

    expect(result).toEqual(images);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("pollForOutputImages throws when ComfyUI rejects /history", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({}, false, 500));

    await expect(
      pollForOutputImages("http://localhost:8188", "p1", { intervalMs: 1, timeoutMs: 10 }),
    ).rejects.toThrow("ComfyUI rejected /history");
  });

  it("pollForOutputImages immediately throws the ComfyUI execution error", async () => {
    const status = {
      status_str: "error",
      messages: [["execution_error", { exception_message: "MPS out of memory" }]],
    };
    jest.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({ p1: { outputs: {}, status } }));

    await expect(
      pollForOutputImages("http://localhost:8188", "p1", { intervalMs: 1 }),
    ).rejects.toThrow("ComfyUI failed on prompt p1: MPS out of memory");
  });

  it("pollForOutputImages uses a generic message when the error has no details", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ p1: { status: { status_str: "error" } } }));

    await expect(
      pollForOutputImages("http://localhost:8188", "p1", { intervalMs: 1 }),
    ).rejects.toThrow("unknown error");
  });

  it("pollForOutputImages throws a timeout error when the prompt never finishes", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({}));

    await expect(
      pollForOutputImages("http://localhost:8188", "p1", { intervalMs: 1, timeoutMs: 5 }),
    ).rejects.toThrow("Timed out");
  });

  it("downloadImage returns the image bytes", async () => {
    const bytes = new TextEncoder().encode("fake-png").buffer;
    jest.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: () => Promise.resolve(bytes),
    } as unknown as Response);

    const buffer = await downloadImage("http://localhost:8188", {
      filename: "a.png",
      subfolder: "decreto",
      type: "output",
    });

    expect(buffer.toString()).toBe("fake-png");
  });

  it("downloadImage throws when ComfyUI rejects /view", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({}, false, 404));

    await expect(
      downloadImage("http://localhost:8188", { filename: "a.png", subfolder: "", type: "output" }),
    ).rejects.toThrow("ComfyUI rejected /view");
  });
});
