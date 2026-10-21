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
  it("replaces the positive prompt and output file prefix", () => {
    const workflow = buildWorkflowForEntry(baseWorkflow(), {
      category: "events",
      name: "coup",
      prompt: "tanks in the street",
    });

    expect(workflow["2"]?.inputs.text).toBe("tanks in the street");
    expect(workflow["7"]?.inputs.filename_prefix).toBe("decreto/events/coup");
  });

  it("keeps the template seed when the input does not define one", () => {
    const workflow = buildWorkflowForEntry(baseWorkflow(), {
      category: "events",
      name: "coup",
      prompt: "tanks in the street",
    });

    expect(workflow["5"]?.inputs.seed).toBe(42);
  });

  it("overrides the seed when the input defines one", () => {
    const workflow = buildWorkflowForEntry(baseWorkflow(), {
      category: "events",
      name: "coup",
      prompt: "tanks in the street",
      seed: 999,
    });

    expect(workflow["5"]?.inputs.seed).toBe(999);
  });

  it("overrides noise_seed when the sampler is KSamplerAdvanced", () => {
    const base = baseWorkflow();
    base["5"] = { class_type: "KSamplerAdvanced", inputs: { noise_seed: 42 } };

    const workflow = buildWorkflowForEntry(base, {
      category: "trailer",
      name: "a2",
      prompt: "hands on a desk",
      seed: 7,
    });

    expect(workflow["5"]?.inputs).toEqual({ noise_seed: 7 });
  });

  it("does not modify the original base template", () => {
    const base = baseWorkflow();
    buildWorkflowForEntry(base, { category: "events", name: "x", prompt: "y" });

    expect(base["2"]?.inputs.text).toBe("{{PROMPT}}");
  });

  it("throws if the template does not have the expected node", () => {
    const base = baseWorkflow();
    delete base["7"];

    expect(() =>
      buildWorkflowForEntry(base, { category: "events", name: "x", prompt: "y" }),
    ).toThrow('is missing node "7"');
  });
});
