import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

export interface RecordOptions {
  /** Página HTML que expõe `window.demo = { duration, render(t) }`. */
  page: string;
  lang: string;
  out: string;
  fps: number;
}

export function frameCount(durationS: number, fps: number): number {
  return Math.round(durationS * fps);
}

export function ffmpegArgs(framesDir: string, fps: number, out: string): string[] {
  return [
    "-y", "-loglevel", "error",
    "-framerate", String(fps),
    "-i", join(framesDir, "%04d.png"),
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-movflags", "+faststart",
    out,
  ];
}

/** Grava a página quadro a quadro (seek determinístico via `demo.render`) e monta o MP4 com ffmpeg. */
export async function record(opts: RecordOptions): Promise<void> {
  const framesDir = mkdtempSync(join(tmpdir(), "trailer-demo-"));
  try {
    await captureFrames(opts, framesDir);
    mkdirSync(dirname(opts.out), { recursive: true });
    execFileSync("ffmpeg", ffmpegArgs(framesDir, opts.fps, opts.out), { stdio: "inherit" });
  } finally {
    rmSync(framesDir, { recursive: true, force: true });
  }
}

async function captureFrames(opts: RecordOptions, framesDir: string): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto(`${pathToFileURL(opts.page).href}?lang=${opts.lang}`, { waitUntil: "networkidle" });
    await page.evaluate("document.fonts.ready");
    const total = frameCount(Number(await page.evaluate("window.demo.duration")), opts.fps);
    for (let i = 0; i < total; i++) {
      await page.evaluate(`window.demo.render(${i / opts.fps})`);
      await page.screenshot({ path: join(framesDir, `${String(i).padStart(4, "0")}.png`) });
    }
  } finally {
    await browser.close();
  }
}
