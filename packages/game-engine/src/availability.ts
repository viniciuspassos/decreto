import type { GameState, NodeStatus } from "@decreto/shared-types";
import type { PolicyTree } from "@decreto/game-content";
import { treeOf, type GameContent } from "./trees.js";

export interface AvailabilityContext {
  state: GameState;
  content: GameContent;
}

/** Ativo ou enfileirado neste turno: conta tanto para pré-requisito quanto para bloqueio mútuo. */
function committed(state: GameState, nodeId: string): boolean {
  return state.activeNodes.includes(nodeId) || state.queue.includes(nodeId);
}

function previousNodeOk(nodeId: string, tree: PolicyTree, state: GameState): boolean {
  const previous = tree.nodes[tree.nodes.indexOf(nodeId) - 1];
  return previous === undefined || state.activeNodes.includes(previous);
}

/** Nó anterior da mesma árvore ativo + qualquer pré-requisito extra (ex.: Monarquia) satisfeito. */
export function prerequisitesMet(nodeId: string, ctx: AvailabilityContext): boolean {
  const tree = treeOf(nodeId, ctx.content);
  if (!tree) return false;
  const extra = ctx.content.extraPrereqs[nodeId];
  const extraOk = !extra || extra.some((n) => ctx.state.activeNodes.includes(n));
  return previousNodeOk(nodeId, tree, ctx.state) && extraOk;
}

function oppositeTreeCommitted(tree: PolicyTree, ctx: AvailabilityContext): boolean {
  if (!tree.opposite) return false;
  const opposite = ctx.content.policyTrees.find((t) => t.id === tree.opposite);
  return opposite?.nodes.some((n) => committed(ctx.state, n)) ?? false;
}

function exclusivePartnerCommitted(nodeId: string, ctx: AvailabilityContext): boolean {
  const pair = ctx.content.exclusiveNodePairs.find((p) => p.includes(nodeId));
  const partner = pair?.find((n) => n !== nodeId);
  return partner !== undefined && committed(ctx.state, partner);
}

/**
 * Árvore oposta (S1, §3.16.1) ou par exclusivo (§6.6) ativo ou enfileirado — bloqueia mesmo
 * dentro da fila do mesmo turno, não só entre nós já ativos.
 */
export function blockedByOpposite(nodeId: string, ctx: AvailabilityContext): boolean {
  const tree = treeOf(nodeId, ctx.content);
  if (!tree) return true;
  return oppositeTreeCommitted(tree, ctx) || exclusivePartnerCommitted(nodeId, ctx);
}

export function nodeStatus(nodeId: string, ctx: AvailabilityContext): NodeStatus {
  if (ctx.state.activeNodes.includes(nodeId)) return "active";
  if (ctx.state.queue.includes(nodeId)) return "queued";
  const available = prerequisitesMet(nodeId, ctx) && !blockedByOpposite(nodeId, ctx);
  return available ? "available" : "blocked";
}
