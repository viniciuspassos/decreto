import { jest } from "@jest/globals";

const record = jest.fn(async () => undefined);
jest.unstable_mockModule("./record.js", () => ({ record }));

describe("bin", () => {
  it("grava o trailer em pt-BR e en", async () => {
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    const { run } = await import("./bin.js");
    record.mockClear();

    await run(["2-ordem-e-futuro"]);

    expect(record).toHaveBeenCalledWith({
      page: "tools/trailer-demo/pages/2-ordem-e-futuro.html",
      lang: "pt-BR",
      out: "assets/trailers/clips/2-ordem-e-futuro/demo-v0-pt-BR.mp4",
      fps: 30,
    });
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ lang: "en" }));
  });

  it("define process.exitCode = 1 quando a gravação falha", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    record.mockRejectedValueOnce(new Error("falha simulada"));
    jest.resetModules();

    await import("./bin.js");
    await new Promise((resolve) => setImmediate(resolve));

    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });
});
