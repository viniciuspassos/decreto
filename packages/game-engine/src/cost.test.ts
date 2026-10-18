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
  it("teste-ouro do roteiro: profundidade 3, distância 2 custa 48", () => {
    // arrest-opponents (secret-police, profundidade 3) com outra árvore de Segurança ativa.
    expect(nodeCost("arrest-opponents", ctx(["harsher-sentences"]))).toBe(48);
  });

  it("distância 0 quando a própria árvore já tem nó ativo", () => {
    expect(nodeCost("carry-restriction", ctx(["mandatory-registration"]))).toBe(30);
  });

  it("distância 1 quando o campo não tem nada ativo", () => {
    expect(nodeCost("mandatory-registration", ctx([]))).toBe(24);
  });

  it("distância 3 quando a árvore oposta está ativa", () => {
    expect(nodeCost("total-gun-ban", ctx(["legal-militias"]))).toBe(62);
  });
});

describe("taxRateCost", () => {
  it("custa a base sem mudar a alíquota", () => {
    expect(taxRateCost(30, 30)).toBe(10);
  });

  it("escala com o número de faixas de 10% percorridas", () => {
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

  it("sem descontos é a soma simples dos custos individuais", () => {
    const base = queueCtx(false, false);
    expect(queueCost(["a", "b", "c"], base)).toBe(
      nodeCost("a", base) + nodeCost("b", base) + nodeCost("c", base),
    );
  });

  it("lua de mel só desconta as 2 primeiras ações da fila, nessa ordem", () => {
    expect(queueCost(["a", "b", "c"], queueCtx(true, false))).toBe(12 + 17 + 24);
  });

  it("desconto de crise só nos campos de Segurança e Poder", () => {
    expect(queueCost(["a", "b", "c"], queueCtx(false, true))).toBe(17 + 24 + 17);
  });

  it("combina lua de mel (por posição) e crise (por campo)", () => {
    expect(queueCost(["a", "b", "c"], queueCtx(true, true))).toBe(8 + 12 + 17);
  });
});
