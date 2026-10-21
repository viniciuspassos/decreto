import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { loadManifest, parseManifest } from "./manifest.js";

describe("parseManifest", () => {
  it("accepts an array of valid entries", () => {
    const raw = JSON.stringify([
      { category: "events", name: "coup", prompt: "tanks in the street" },
    ]);

    expect(parseManifest(raw)).toEqual([
      { category: "events", name: "coup", prompt: "tanks in the street", seed: undefined },
    ]);
  });

  it("accepts an optional numeric seed", () => {
    const raw = JSON.stringify([
      { category: "events", name: "coup", prompt: "tanks in the street", seed: 7 },
    ]);

    const [entry] = parseManifest(raw);
    expect(entry?.seed).toBe(7);
  });

  it("rejects a value that is not an array", () => {
    expect(() => parseManifest(JSON.stringify({ foo: "bar" }))).toThrow(
      "manifest must be an array",
    );
  });

  it("rejects an entry that is not an object", () => {
    expect(() => parseManifest(JSON.stringify(["x"]))).toThrow("expected an object");
  });

  it("rejects a category that does not match the slug pattern", () => {
    const raw = JSON.stringify([{ category: "Eventos!", name: "x", prompt: "y" }]);
    expect(() => parseManifest(raw)).toThrow('"category"');
  });

  it("rejects a name that does not match the slug pattern", () => {
    const raw = JSON.stringify([{ category: "events", name: "X Y", prompt: "y" }]);
    expect(() => parseManifest(raw)).toThrow('"name"');
  });

  it("rejects an empty prompt", () => {
    const raw = JSON.stringify([{ category: "events", name: "x", prompt: "   " }]);
    expect(() => parseManifest(raw)).toThrow('"prompt" must be a non-empty string');
  });

  it("rejects a seed that is not a number", () => {
    const raw = JSON.stringify([{ category: "events", name: "x", prompt: "y", seed: "7" }]);
    expect(() => parseManifest(raw)).toThrow('"seed" must be a number');
  });
});

describe("loadManifest", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "decreto-manifest-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("reads and parses the manifest from disk", () => {
    const path = join(dir, "manifest.json");
    writeFileSync(path, JSON.stringify([{ category: "events", name: "x", prompt: "y" }]));

    expect(loadManifest(path)).toEqual([
      { category: "events", name: "x", prompt: "y", seed: undefined },
    ]);
  });
});
