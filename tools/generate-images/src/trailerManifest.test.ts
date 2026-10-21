import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import {
  loadTrailerClipEntries,
  loadTrailerManifest,
  parseTrailerManifest,
  resolveTrailerClipEntries,
} from "./trailerManifest.js";

describe("parseTrailerManifest", () => {
  it("accepts shared, clip, and other kinds of plans", () => {
    const raw = JSON.stringify({
      trailer: "1-mandato",
      plans: [
        { id: "a2", shared: true },
        { id: "1-01", kind: "clip", prompt: "hands on a desk" },
        { id: "1-02", kind: "clip", prompt: "classroom", seed: 7 },
        { id: "1-03", kind: "screen", file: "gravacoes/1-03.mov", seconds: 3 },
      ],
    });

    expect(parseTrailerManifest(raw)).toEqual({
      trailer: "1-mandato",
      plans: [
        { id: "a2", shared: true },
        { id: "1-01", kind: "clip", prompt: "hands on a desk", seed: undefined },
        { id: "1-02", kind: "clip", prompt: "classroom", seed: 7 },
        { id: "1-03", kind: "screen" },
      ],
    });
  });

  it("accepts an empty prompt (pending plan)", () => {
    const raw = JSON.stringify({
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip", prompt: "" }],
    });

    expect(parseTrailerManifest(raw).plans[0]).toEqual({
      id: "1-01",
      kind: "clip",
      prompt: "",
      seed: undefined,
    });
  });

  it("rejects a value that is not an object", () => {
    expect(() => parseTrailerManifest(JSON.stringify(["x"]))).toThrow(
      'trailer manifest must be an object',
    );
  });

  it("rejects a plan that is not an object", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: ["x"] });
    expect(() => parseTrailerManifest(raw)).toThrow("invalid plan: expected an object");
  });

  it("rejects a trailer that does not match the slug pattern", () => {
    const raw = JSON.stringify({ trailer: "1 Mandato", plans: [] });
    expect(() => parseTrailerManifest(raw)).toThrow('"trailer"');
  });

  it("rejects plans that are not an array", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: {} });
    expect(() => parseTrailerManifest(raw)).toThrow('"plans"');
  });

  it("rejects a plan without a valid id", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: [{ id: "A B", kind: "clip", prompt: "x" }] });
    expect(() => parseTrailerManifest(raw)).toThrow('"id"');
  });

  it("rejects a clip plan without a prompt", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: [{ id: "1-01", kind: "clip" }] });
    expect(() => parseTrailerManifest(raw)).toThrow('"prompt" is required');
  });

  it("rejects a seed that is not a number", () => {
    const raw = JSON.stringify({
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip", prompt: "x", seed: "7" }],
    });
    expect(() => parseTrailerManifest(raw)).toThrow('"seed" must be a number');
  });

  it("rejects an unknown kind", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: [{ id: "1-01", kind: "video" }] });
    expect(() => parseTrailerManifest(raw)).toThrow('invalid "kind"');
  });
});

describe("resolveTrailerClipEntries", () => {
  it("creates one entry per clip plan, with category = trailer and name = id-sSEED", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip" as const, prompt: "hands on a desk", seed: 7 }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([
      { category: "1-mandato", name: "1-01-s7", prompt: "hands on a desk", seed: 7 },
    ]);
  });

  it("uses the default seed 42 when the plan does not define one", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip" as const, prompt: "hands on a desk" }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([
      { category: "1-mandato", name: "1-01-s42", prompt: "hands on a desk", seed: 42 },
    ]);
  });

  it("ignores clip plans with a pending (empty) prompt", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip" as const, prompt: "" }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([]);
  });

  it("ignores screen/image/black plans", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-03", kind: "screen" as const }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([]);
  });

  it("resolves a shared plan by looking it up in sharedManifest, with category = shared", () => {
    const trailerManifest = { trailer: "1-mandato", plans: [{ id: "a2", shared: true as const }] };
    const sharedManifest = {
      trailer: "shared",
      plans: [{ id: "a2", kind: "clip" as const, prompt: "hands on a desk", seed: 42 }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, sharedManifest)).toEqual([
      { category: "shared", name: "a2-s42", prompt: "hands on a desk", seed: 42 },
    ]);
  });

  it("ignores a shared plan whose counterpart in shared is pending or is not a clip", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [
        { id: "a1", shared: true as const },
        { id: "a2", shared: true as const },
      ],
    };
    const sharedManifest = {
      trailer: "shared",
      plans: [
        { id: "a1", kind: "black" as const },
        { id: "a2", kind: "clip" as const, prompt: "" },
      ],
    };

    expect(resolveTrailerClipEntries(trailerManifest, sharedManifest)).toEqual([]);
  });

  it("throws when the shared plan does not exist in sharedManifest", () => {
    const trailerManifest = { trailer: "1-mandato", plans: [{ id: "a2", shared: true as const }] };

    expect(() => resolveTrailerClipEntries(trailerManifest, undefined)).toThrow(
      'shared plan "a2" not found in shared.manifest.json',
    );
  });

  it("includes the actual sharedManifestPath in the error message when provided", () => {
    const trailerManifest = { trailer: "1-mandato", plans: [{ id: "a2", shared: true as const }] };

    expect(() => resolveTrailerClipEntries(trailerManifest, undefined, "custom-shared.json")).toThrow(
      'shared plan "a2" not found in custom-shared.json',
    );
  });

  it("throws when a shared plan points to another shared plan in shared", () => {
    const trailerManifest = { trailer: "1-mandato", plans: [{ id: "a2", shared: true as const }] };
    const sharedManifest = { trailer: "shared", plans: [{ id: "a2", shared: true as const }] };

    expect(() => resolveTrailerClipEntries(trailerManifest, sharedManifest)).toThrow(
      'shared plan "a2" cannot point to another shared plan',
    );
  });
});

describe("loadTrailerManifest / loadTrailerClipEntries", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "decreto-trailer-manifest-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("loadTrailerManifest reads and parses the manifest from disk", () => {
    const path = join(dir, "1-mandato.manifest.json");
    writeFileSync(path, JSON.stringify({ trailer: "1-mandato", plans: [] }));

    expect(loadTrailerManifest(path)).toEqual({ trailer: "1-mandato", plans: [] });
  });

  it("loadTrailerClipEntries looks for shared.manifest.json next to the trailer manifest", () => {
    writeFileSync(
      join(dir, "shared.manifest.json"),
      JSON.stringify({ trailer: "shared", plans: [{ id: "a2", kind: "clip", prompt: "hands", seed: 1 }] }),
    );
    const trailerPath = join(dir, "1-mandato.manifest.json");
    writeFileSync(
      trailerPath,
      JSON.stringify({
        trailer: "1-mandato",
        plans: [
          { id: "a2", shared: true },
          { id: "1-01", kind: "clip", prompt: "desk" },
        ],
      }),
    );

    expect(loadTrailerClipEntries(trailerPath)).toEqual([
      { category: "shared", name: "a2-s1", prompt: "hands", seed: 1 },
      { category: "1-mandato", name: "1-01-s42", prompt: "desk", seed: 42 },
    ]);
  });

  it("loadTrailerClipEntries accepts an explicit sharedManifestPath", () => {
    const sharedPath = join(dir, "other-shared.json");
    writeFileSync(
      sharedPath,
      JSON.stringify({ trailer: "shared", plans: [{ id: "a2", kind: "clip", prompt: "hands", seed: 1 }] }),
    );
    const trailerPath = join(dir, "1-mandato.manifest.json");
    writeFileSync(trailerPath, JSON.stringify({ trailer: "1-mandato", plans: [{ id: "a2", shared: true }] }));

    expect(loadTrailerClipEntries(trailerPath, sharedPath)).toEqual([
      { category: "shared", name: "a2-s1", prompt: "hands", seed: 1 },
    ]);
  });

  it("loadTrailerClipEntries throws a shared plan error when shared.manifest.json does not exist", () => {
    const trailerPath = join(dir, "1-mandato.manifest.json");
    writeFileSync(trailerPath, JSON.stringify({ trailer: "1-mandato", plans: [{ id: "a2", shared: true }] }));

    expect(() => loadTrailerClipEntries(trailerPath)).toThrow('shared plan "a2" not found');
  });

  it("loadTrailerClipEntries includes the custom sharedManifestPath in the error message when passed", () => {
    const trailerPath = join(dir, "1-mandato.manifest.json");
    writeFileSync(trailerPath, JSON.stringify({ trailer: "1-mandato", plans: [{ id: "a2", shared: true }] }));
    const sharedPath = join(dir, "custom-shared.json");

    expect(() => loadTrailerClipEntries(trailerPath, sharedPath)).toThrow(
      `shared plan "a2" not found in ${sharedPath}`,
    );
  });
});
