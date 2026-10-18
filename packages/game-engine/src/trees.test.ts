import type { GameState } from "@decreto/shared-types";
import { activeCount, depthOf, treeOf, type GameContent } from "./trees.js";

const content: GameContent = {
  policyTrees: [
    { id: "disarmament", field: "security", opposite: "civil-arms", nodes: ["mandatory-registration", "carry-restriction"] },
    { id: "civil-arms", field: "security", opposite: "disarmament", nodes: ["easier-registration", "citizen-carry"] },
  ],
  extraPrereqs: {},
  exclusiveNodePairs: [],
};

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

describe("treeOf", () => {
  it("encontra a árvore que contém o nó", () => {
    expect(treeOf("carry-restriction", content)?.id).toBe("disarmament");
  });

  it("retorna undefined para nó inexistente", () => {
    expect(treeOf("unknown-node", content)).toBeUndefined();
  });
});

describe("depthOf", () => {
  it("é 1-based a partir do início da árvore", () => {
    expect(depthOf("mandatory-registration", content)).toBe(1);
    expect(depthOf("carry-restriction", content)).toBe(2);
  });

  it("é 0 para nó inexistente", () => {
    expect(depthOf("unknown-node", content)).toBe(0);
  });
});

describe("activeCount", () => {
  it("conta só os nós ativos da árvore pedida", () => {
    const s = state(["mandatory-registration", "easier-registration"]);
    expect(activeCount(s, "disarmament", content)).toBe(1);
    expect(activeCount(s, "civil-arms", content)).toBe(1);
  });

  it("é 0 quando nenhum nó da árvore está ativo", () => {
    expect(activeCount(state([]), "disarmament", content)).toBe(0);
  });
});
