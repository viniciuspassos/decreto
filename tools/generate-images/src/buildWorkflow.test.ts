import { describe, expect, it } from "@jest/globals";
import { buildWorkflowForEntry } from "./buildWorkflow.js";
import type { ApiWorkflow } from "./types.js";

function baseWorkflow(): ApiWorkflow {
  return {
    "2": { class_type: "CLIPTextEncode", inputs: { clip: ["1", 1], text: "{{PROMPT}}" } },
    "5": { class_type: "KSampler", inputs: { seed: 42, steps: 6 } },
    "7": { class_type: "SaveImage", inputs: { filename_prefix: "decreto/_base" } },
  };
}

describe("buildWorkflowForEntry", () => {
  it("substitui o prompt positivo e o prefixo do arquivo de saída", () => {
    const workflow = buildWorkflowForEntry(baseWorkflow(), {
      category: "eventos",
      name: "golpe-militar",
      prompt: "tanks in the street",
    });

    expect(workflow["2"]?.inputs.text).toBe("tanks in the street");
    expect(workflow["7"]?.inputs.filename_prefix).toBe("decreto/eventos/golpe-militar");
  });

  it("mantém a seed do template quando a entrada não define uma", () => {
    const workflow = buildWorkflowForEntry(baseWorkflow(), {
      category: "eventos",
      name: "golpe-militar",
      prompt: "tanks in the street",
    });

    expect(workflow["5"]?.inputs.seed).toBe(42);
  });

  it("sobrescreve a seed quando a entrada define uma", () => {
    const workflow = buildWorkflowForEntry(baseWorkflow(), {
      category: "eventos",
      name: "golpe-militar",
      prompt: "tanks in the street",
      seed: 999,
    });

    expect(workflow["5"]?.inputs.seed).toBe(999);
  });

  it("não modifica o template base original", () => {
    const base = baseWorkflow();
    buildWorkflowForEntry(base, { category: "eventos", name: "x", prompt: "y" });

    expect(base["2"]?.inputs.text).toBe("{{PROMPT}}");
  });

  it("lança erro se o template não tiver o nó esperado", () => {
    const base = baseWorkflow();
    delete base["7"];

    expect(() =>
      buildWorkflowForEntry(base, { category: "eventos", name: "x", prompt: "y" }),
    ).toThrow('não tem o nó "7"');
  });
});
