import type { GameState } from "@decreto/shared-types";
import type { AvailabilityContext } from "./availability.js";
import { blockedByOpposite, nodeStatus, prerequisitesMet } from "./availability.js";
import type { GameContent } from "./trees.js";

const content: GameContent = {
  policyTrees: [
    { id: "disarmament", field: "security", opposite: "civil-arms", nodes: ["mandatory-registration", "carry-restriction"] },
    { id: "civil-arms", field: "security", opposite: "disarmament", nodes: ["easier-registration", "citizen-carry"] },
    { id: "authoritarianism", field: "power", nodes: ["congress-dissolution"] },
    { id: "personality-cult", field: "power", nodes: ["mandatory-portraits"] },
    { id: "monarchy", field: "power", nodes: ["lifetime-title"] },
    { id: "gambling", field: "customs", nodes: ["casino-ban"] },
    { id: "gambling-opposite", field: "customs", nodes: ["casinos-allowed"] },
  ],
  extraPrereqs: { "lifetime-title": ["congress-dissolution", "mandatory-portraits"] },
  exclusiveNodePairs: [["casino-ban", "casinos-allowed"]],
};

function state(activeNodes: string[], queue: string[] = []): GameState {
  return {
    country: "Vessária", president: "Helena Duarte", turn: 1, term: 1, approval: 50,
    capital: 60, capitalPerTurn: 25, activeNodes, queue,
    indicators: {
      gdp: 0, unemployment: 0, inflation: 0, debt: 0, crime: 0,
      health: 0, education: 0, pollution: 0, pressFreedom: 0, corruption: 0,
    },
    groups: [], actors: { media: "neutral", military: "loyal" }, promises: [], history: [],
  };
}

function ctx(activeNodes: string[], queue: string[] = []): AvailabilityContext {
  return { state: state(activeNodes, queue), content };
}

describe("prerequisitesMet", () => {
  it("exige o nó anterior da mesma árvore ativo", () => {
    expect(prerequisitesMet("carry-restriction", ctx([]))).toBe(false);
    expect(prerequisitesMet("carry-restriction", ctx(["mandatory-registration"]))).toBe(true);
  });

  it("primeiro nó da árvore não exige nada", () => {
    expect(prerequisitesMet("mandatory-registration", ctx([]))).toBe(true);
  });

  it("pré-requisito extra é satisfeito por qualquer um dos nós listados", () => {
    expect(prerequisitesMet("lifetime-title", ctx([]))).toBe(false);
    expect(prerequisitesMet("lifetime-title", ctx(["mandatory-portraits"]))).toBe(true);
  });
});

describe("blockedByOpposite", () => {
  it("bloqueia quando a árvore oposta tem nó ativo", () => {
    expect(blockedByOpposite("carry-restriction", ctx(["easier-registration"]))).toBe(true);
  });

  it("bloqueia quando a árvore oposta só tem nó na fila do mesmo turno", () => {
    expect(blockedByOpposite("carry-restriction", ctx([], ["easier-registration"]))).toBe(true);
  });

  it("não bloqueia quando a oposta está livre", () => {
    expect(blockedByOpposite("carry-restriction", ctx([]))).toBe(false);
  });

  it("bloqueia par exclusivo mesmo sem árvores opostas", () => {
    expect(blockedByOpposite("casino-ban", ctx(["casinos-allowed"]))).toBe(true);
  });
});

describe("nodeStatus", () => {
  it("é active quando já ativo e queued quando na fila", () => {
    expect(nodeStatus("mandatory-registration", ctx(["mandatory-registration"]))).toBe("active");
    expect(nodeStatus("carry-restriction", ctx([], ["carry-restriction"]))).toBe("queued");
  });

  it("é available quando pré-requisitos ok e nada bloqueia", () => {
    expect(nodeStatus("mandatory-registration", ctx([]))).toBe("available");
  });

  it("é blocked sem pré-requisito ou com oposta ativa", () => {
    expect(nodeStatus("carry-restriction", ctx([]))).toBe("blocked");
    expect(nodeStatus("mandatory-registration", ctx(["easier-registration"]))).toBe("blocked");
  });
});
