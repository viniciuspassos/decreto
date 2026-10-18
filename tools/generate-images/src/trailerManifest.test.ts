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
  it("aceita planos shared, clip e outros kinds", () => {
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

  it("aceita prompt vazio (plano pendente)", () => {
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

  it("rejeita um valor que não é objeto", () => {
    expect(() => parseTrailerManifest(JSON.stringify(["x"]))).toThrow(
      'manifest de trailer deve ser um objeto',
    );
  });

  it("rejeita plano que não é objeto", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: ["x"] });
    expect(() => parseTrailerManifest(raw)).toThrow("plano inválido: não é um objeto");
  });

  it("rejeita trailer fora do padrão slug", () => {
    const raw = JSON.stringify({ trailer: "1 Mandato", plans: [] });
    expect(() => parseTrailerManifest(raw)).toThrow('"trailer"');
  });

  it("rejeita plans que não é array", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: {} });
    expect(() => parseTrailerManifest(raw)).toThrow('"plans"');
  });

  it("rejeita plano sem id válido", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: [{ id: "A B", kind: "clip", prompt: "x" }] });
    expect(() => parseTrailerManifest(raw)).toThrow('"id"');
  });

  it("rejeita plano clip sem prompt", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: [{ id: "1-01", kind: "clip" }] });
    expect(() => parseTrailerManifest(raw)).toThrow('"prompt" é obrigatório');
  });

  it("rejeita seed que não é número", () => {
    const raw = JSON.stringify({
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip", prompt: "x", seed: "7" }],
    });
    expect(() => parseTrailerManifest(raw)).toThrow('"seed" deve ser número');
  });

  it("rejeita kind desconhecido", () => {
    const raw = JSON.stringify({ trailer: "1-mandato", plans: [{ id: "1-01", kind: "video" }] });
    expect(() => parseTrailerManifest(raw)).toThrow('"kind" inválido');
  });
});

describe("resolveTrailerClipEntries", () => {
  it("gera uma entrada por plano clip, com category = trailer e name = id-sSEED", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip" as const, prompt: "hands on a desk", seed: 7 }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([
      { category: "1-mandato", name: "1-01-s7", prompt: "hands on a desk", seed: 7 },
    ]);
  });

  it("usa a seed padrão 42 quando o plano não define uma", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip" as const, prompt: "hands on a desk" }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([
      { category: "1-mandato", name: "1-01-s42", prompt: "hands on a desk", seed: 42 },
    ]);
  });

  it("ignora planos clip com prompt pendente (vazio)", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-01", kind: "clip" as const, prompt: "" }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([]);
  });

  it("ignora planos screen/image/black", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [{ id: "1-03", kind: "screen" as const }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, undefined)).toEqual([]);
  });

  it("resolve plano shared buscando em comumManifest, com category = comum", () => {
    const trailerManifest = { trailer: "1-mandato", plans: [{ id: "a2", shared: true as const }] };
    const comumManifest = {
      trailer: "comum",
      plans: [{ id: "a2", kind: "clip" as const, prompt: "hands on a desk", seed: 42 }],
    };

    expect(resolveTrailerClipEntries(trailerManifest, comumManifest)).toEqual([
      { category: "comum", name: "a2-s42", prompt: "hands on a desk", seed: 42 },
    ]);
  });

  it("ignora plano shared cujo correspondente em comum está pendente ou não é clip", () => {
    const trailerManifest = {
      trailer: "1-mandato",
      plans: [
        { id: "a1", shared: true as const },
        { id: "a2", shared: true as const },
      ],
    };
    const comumManifest = {
      trailer: "comum",
      plans: [
        { id: "a1", kind: "black" as const },
        { id: "a2", kind: "clip" as const, prompt: "" },
      ],
    };

    expect(resolveTrailerClipEntries(trailerManifest, comumManifest)).toEqual([]);
  });

  it("lança erro quando o plano shared não existe em comumManifest", () => {
    const trailerManifest = { trailer: "1-mandato", plans: [{ id: "a2", shared: true as const }] };

    expect(() => resolveTrailerClipEntries(trailerManifest, undefined)).toThrow(
      'plano compartilhado "a2" não encontrado',
    );
  });

  it("lança erro quando o plano shared aponta para outro plano shared em comum", () => {
    const trailerManifest = { trailer: "1-mandato", plans: [{ id: "a2", shared: true as const }] };
    const comumManifest = { trailer: "comum", plans: [{ id: "a2", shared: true as const }] };

    expect(() => resolveTrailerClipEntries(trailerManifest, comumManifest)).toThrow(
      'plano compartilhado "a2" não pode apontar para outro plano shared',
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

  it("loadTrailerManifest lê e parseia o manifest do disco", () => {
    const path = join(dir, "1-mandato.manifest.json");
    writeFileSync(path, JSON.stringify({ trailer: "1-mandato", plans: [] }));

    expect(loadTrailerManifest(path)).toEqual({ trailer: "1-mandato", plans: [] });
  });

  it("loadTrailerClipEntries busca comum.manifest.json ao lado do manifest do trailer", () => {
    writeFileSync(
      join(dir, "comum.manifest.json"),
      JSON.stringify({ trailer: "comum", plans: [{ id: "a2", kind: "clip", prompt: "hands", seed: 1 }] }),
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
      { category: "comum", name: "a2-s1", prompt: "hands", seed: 1 },
      { category: "1-mandato", name: "1-01-s42", prompt: "desk", seed: 42 },
    ]);
  });

  it("loadTrailerClipEntries aceita um comumManifestPath explícito", () => {
    const comumPath = join(dir, "outro-comum.json");
    writeFileSync(
      comumPath,
      JSON.stringify({ trailer: "comum", plans: [{ id: "a2", kind: "clip", prompt: "hands", seed: 1 }] }),
    );
    const trailerPath = join(dir, "1-mandato.manifest.json");
    writeFileSync(trailerPath, JSON.stringify({ trailer: "1-mandato", plans: [{ id: "a2", shared: true }] }));

    expect(loadTrailerClipEntries(trailerPath, comumPath)).toEqual([
      { category: "comum", name: "a2-s1", prompt: "hands", seed: 1 },
    ]);
  });

  it("loadTrailerClipEntries lança erro de plano shared quando comum.manifest.json não existe", () => {
    const trailerPath = join(dir, "1-mandato.manifest.json");
    writeFileSync(trailerPath, JSON.stringify({ trailer: "1-mandato", plans: [{ id: "a2", shared: true }] }));

    expect(() => loadTrailerClipEntries(trailerPath)).toThrow('plano compartilhado "a2" não encontrado');
  });
});
