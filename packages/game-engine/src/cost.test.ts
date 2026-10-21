import { EXCLUSIVE_NODE_PAIRS, EXTRA_PREREQS, policyTrees } from "@decreto/game-content";
import type { GameState } from "@decreto/shared-types";
import type { GameContent } from "./trees.js";
import type { CostContext, QueueCostContext } from "./cost.js";
import { nodeCost, queueCost, taxRateCost } from "./cost.js";

const realContent: GameContent = { policyTrees, extraPrereqs: EXTRA_PREREQS, exclusiveNodePairs: EXCLUSIVE_NODE_PAIRS };

function state(activeNodes: string[]): GameState {
  return {
    country: "Vessária", president: "Helena Duarte", turn: 1, term: 1, approval: 50,
    capital: 60, capitalPerTurn: 25, activeNodes, queue: [],
    indicators: {
      gdp: 0, unemployment: 0, inflation: 0, debt: 0, crime: 0,
      health: 0, education: 0, pollution: 0, pressFreedom: 0, corruption: 0,
    },
    groups: [], actors: { media: "neutral", military: "loyal" }, promises: [], history: [],
  };
}

function ctx(activeNodes: string[]): CostContext {
  return { state: state(activeNodes), content: realContent };
}

describe("nodeCost", () => {
  it("golden-path test: depth 3, distance 2 costs 48", () => {
    // arrest-opponents (secret-police, depth 3) with another Security tree active.
    expect(nodeCost("arrest-opponents", ctx(["harsher-sentences"]))).toBe(48);
  });

  it("distance 0 when the same tree already has an active node", () => {
    expect(nodeCost("carry-restriction", ctx(["mandatory-registration"]))).toBe(30);
  });

  it("distance 1 when the field has nothing active", () => {
    expect(nodeCost("mandatory-registration", ctx([]))).toBe(24);
  });

  it("distance 3 when the opposing tree is active", () => {
    expect(nodeCost("total-gun-ban", ctx(["legal-militias"]))).toBe(62);
  });
});

describe("taxRateCost", () => {
  it("costs the base amount without changing the tax rate", () => {
    expect(taxRateCost(30, 30)).toBe(10);
  });

  it("scales with the number of 10% increments crossed", () => {
    expect(taxRateCost(30, 40)).toBe(20);
    expect(taxRateCost(0, 70)).toBe(80);
    expect(taxRateCost(70, 0)).toBe(80);
  });
});

describe("queueCost", () => {
  const small: GameContent = {
    policyTrees: [
      { id: "sec-tree", field: "security", nodes: ["a", "b"] },
      { id: "power-tree", field: "power", nodes: ["c"] },
    ],
    extraPrereqs: {},
    exclusiveNodePairs: [],
  };

  function queueCtx(isHoneymoon: boolean, isCrisis: boolean): QueueCostContext {
    return { state: state([]), content: small, isHoneymoon, isCrisis };
  }

  it("without discounts, equals the simple sum of individual costs", () => {
    const base = queueCtx(false, false);
    expect(queueCost(["a", "b", "c"], base)).toBe(
      nodeCost("a", base) + nodeCost("b", base) + nodeCost("c", base),
    );
  });

  it("honeymoon discounts only the first 2 actions in the queue, in that order", () => {
    expect(queueCost(["a", "b", "c"], queueCtx(true, false))).toBe(12 + 17 + 24);
  });

  it("crisis discount applies only to Security and Power fields", () => {
    expect(queueCost(["a", "b", "c"], queueCtx(false, true))).toBe(17 + 24 + 17);
  });

  it("combines honeymoon (by position) and crisis (by field)", () => {
    expect(queueCost(["a", "b", "c"], queueCtx(true, true))).toBe(8 + 12 + 17);
  });
});
