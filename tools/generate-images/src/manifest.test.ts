import { describe, expect, it } from "@jest/globals";
import { parseManifest } from "./manifest.js";

describe("parseManifest", () => {
  it("aceita um array de entradas válidas", () => {
    const raw = JSON.stringify([
      { category: "eventos", name: "golpe-militar", prompt: "tanks in the street" },
    ]);

    expect(parseManifest(raw)).toEqual([
      { category: "eventos", name: "golpe-militar", prompt: "tanks in the street", seed: undefined },
    ]);
  });

  it("aceita seed numérico opcional", () => {
    const raw = JSON.stringify([
      { category: "eventos", name: "golpe-militar", prompt: "tanks in the street", seed: 7 },
    ]);

    const [entry] = parseManifest(raw);
    expect(entry?.seed).toBe(7);
  });

  it("rejeita um valor que não é array", () => {
    expect(() => parseManifest(JSON.stringify({ foo: "bar" }))).toThrow(
      "manifest deve ser um array",
    );
  });

  it("rejeita entrada que não é objeto", () => {
    expect(() => parseManifest(JSON.stringify(["x"]))).toThrow("não é um objeto");
  });

  it("rejeita category fora do padrão slug", () => {
    const raw = JSON.stringify([{ category: "Eventos!", name: "x", prompt: "y" }]);
    expect(() => parseManifest(raw)).toThrow('"category"');
  });

  it("rejeita name fora do padrão slug", () => {
    const raw = JSON.stringify([{ category: "eventos", name: "X Y", prompt: "y" }]);
    expect(() => parseManifest(raw)).toThrow('"name"');
  });

  it("rejeita prompt vazio", () => {
    const raw = JSON.stringify([{ category: "eventos", name: "x", prompt: "   " }]);
    expect(() => parseManifest(raw)).toThrow('"prompt" vazio');
  });

  it("rejeita seed que não é número", () => {
    const raw = JSON.stringify([{ category: "eventos", name: "x", prompt: "y", seed: "7" }]);
    expect(() => parseManifest(raw)).toThrow('"seed" deve ser número');
  });
});
