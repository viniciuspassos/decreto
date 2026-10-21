import { BASE_INDICATORS, policyTrees, voterGroups } from "@decreto/game-content";
import type { GameView } from "@decreto/shared-types";

export function gameFixture(): GameView {
  const nodes = Object.fromEntries(policyTrees.flatMap((tree) => tree.nodes.map((nodeId, index) =>
    [nodeId, { status: index === 0 ? "available" : "blocked", cost: index === 0 ? 20 : null }]))) as GameView["nodes"];
  return {
    id: "game-1", version: 1, phase: "playing", end: null, maxActions: 6,
    country: "República de Vessária", president: "Helena Duarte", turn: 1, term: 1,
    approval: 50, capital: 60, capitalPerTurn: 25, activeNodes: [], indicators: BASE_INDICATORS,
    groups: voterGroups.map((group) => ({ id: group.id, size: group.initialSize, support: 50,
      delta: 0, loyalty: "medium", memory: null })),
    actors: { media: "neutral", military: "loyal" }, promises: [], history: [], nodes,
  };
}
