import type { PolicyTree } from "@decreto/game-content";
import type { GameState } from "@decreto/shared-types";

/**
 * Tree/policy catalog injected by the caller instead of imported directly by rule modules.
 * This keeps `game-engine` testable with small catalogs (see CLAUDE.md -> "game-engine
 * should be independently testable").
 */
export interface GameContent {
  policyTrees: PolicyTree[];
  extraPrereqs: Record<string, string[]>;
  exclusiveNodePairs: [string, string][];
}

/** Tree containing the node, or `undefined` if none has that ID. */
export function treeOf(nodeId: string, content: GameContent) {
  return content.policyTrees.find((tree) => tree.nodes.includes(nodeId));
}

/** Node position in the tree, 1-based; 0 if the node does not exist in any tree. */
export function depthOf(nodeId: string, content: GameContent): number {
  const tree = treeOf(nodeId, content);
  return tree ? tree.nodes.indexOf(nodeId) + 1 : 0;
}

/** Number of nodes from tree `treeId` that are active in the state. */
export function activeCount(state: GameState, treeId: string, content: GameContent): number {
  return state.activeNodes.filter((nodeId) => treeOf(nodeId, content)?.id === treeId).length;
}
