import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readEventImageManifest } from "./imageManifest.js";

describe("readEventImageManifest", () => {
  let assetsDir: string;

  beforeEach(async () => {
    assetsDir = await mkdtemp(path.join(os.tmpdir(), "decreto-image-manifest-"));
    await mkdir(path.join(assetsDir, "event-a"));
    await mkdir(path.join(assetsDir, "event-b", "nested"), { recursive: true });
    await writeFile(path.join(assetsDir, "event-a", "scene.png"), "image");
    await writeFile(path.join(assetsDir, "event-a", "alternate.JPG"), "image");
    await writeFile(path.join(assetsDir, "event-a", "notes.txt"), "ignore");
    await writeFile(path.join(assetsDir, "event-b", "nested", "hidden.png"), "ignore");
  });

  afterEach(async () => {
    await rm(assetsDir, { recursive: true, force: true });
  });

  it("maps supported image files from event subfolders to relative locations", async () => {
    await expect(readEventImageManifest(assetsDir)).resolves.toEqual([
      { eventName: "event-a", fileLocation: "event-a/alternate.JPG" },
      { eventName: "event-a", fileLocation: "event-a/scene.png" },
    ]);
  });
});
