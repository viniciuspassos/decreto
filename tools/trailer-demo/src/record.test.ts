import { jest } from "@jest/globals";

const screenshot = jest.fn(async () => undefined);
const evaluate = jest.fn(async (expr: string) => (expr === "window.demo.duration" ? 0.1 : undefined));
const goto = jest.fn(async () => undefined);
const close = jest.fn(async () => undefined);
const newPage = jest.fn(async () => ({ goto, evaluate, screenshot }));
const execFileSync = jest.fn();
const rmSync = jest.fn();

jest.unstable_mockModule("playwright", () => ({
  chromium: { launch: jest.fn(async () => ({ newPage, close })) },
}));
jest.unstable_mockModule("node:child_process", () => ({ execFileSync }));
jest.unstable_mockModule("node:fs", () => ({
  mkdtempSync: jest.fn(() => "/tmp/frames"),
  mkdirSync: jest.fn(),
  rmSync,
}));

const { ffmpegArgs, frameCount, record } = await import("./record.js");

describe("frameCount", () => {
  it("arredonda duração × fps", () => {
    expect(frameCount(10, 30)).toBe(300);
    expect(frameCount(0.1, 30)).toBe(3);
  });
});

describe("ffmpegArgs", () => {
  it("monta H.264 yuv420p a partir da sequência de PNGs", () => {
    const args = ffmpegArgs("/tmp/frames", 30, "out.mp4");
    expect(args).toEqual(expect.arrayContaining(["-framerate", "30", "-i", "/tmp/frames/%04d.png", "libx264", "yuv420p"]));
    expect(args.at(-1)).toBe("out.mp4");
  });
});

describe("record", () => {
  it("faz seek de cada quadro, captura e monta o vídeo", async () => {
    await record({ page: "/x/demo.html", lang: "en", out: "/out/demo.mp4", fps: 30 });

    expect(goto).toHaveBeenCalledWith("file:///x/demo.html?lang=en", { waitUntil: "networkidle" });
    expect(evaluate).toHaveBeenCalledWith("window.demo.render(0)");
    expect(evaluate).toHaveBeenCalledWith(`window.demo.render(${2 / 30})`);
    expect(screenshot).toHaveBeenCalledTimes(3);
    expect(screenshot).toHaveBeenLastCalledWith({ path: "/tmp/frames/0002.png" });
    expect(close).toHaveBeenCalled();
    expect(execFileSync).toHaveBeenCalledWith("ffmpeg", ffmpegArgs("/tmp/frames", 30, "/out/demo.mp4"), { stdio: "inherit" });
    expect(rmSync).toHaveBeenCalledWith("/tmp/frames", { recursive: true, force: true });
  });

  it("apaga os quadros temporários mesmo quando a captura falha", async () => {
    rmSync.mockClear();
    screenshot.mockRejectedValueOnce(new Error("falha simulada"));

    await expect(record({ page: "/x/demo.html", lang: "en", out: "/out/demo.mp4", fps: 30 })).rejects.toThrow("falha simulada");

    expect(close).toHaveBeenCalled();
    expect(rmSync).toHaveBeenCalledWith("/tmp/frames", { recursive: true, force: true });
  });
});
