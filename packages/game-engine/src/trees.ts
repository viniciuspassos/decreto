import type { PolicyTree } from "@decreto/game-content";
import type { GameState } from "@decreto/shared-types";

/**
 * Catálogo de árvores/políticas injetado pelo chamador, em vez de importado direto pelos módulos
 * de regra — mantém `game-engine` testável com catálogos pequenos (ver CLAUDE.md -> "game-engine
 * deve ser testável de forma isolada").
 */
export interface GameContent {
  policyTrees: PolicyTree[];
  extraPrereqs: Record<string, string[]>;
  exclusiveNodePairs: [string, string][];
}

/** Árvore a que o nó pertence, ou `undefined` se não houver nenhuma com esse id. */
export function treeOf(nodeId: string, content: GameContent) {
  return content.policyTrees.find((tree) => tree.nodes.includes(nodeId));
}

/** Posição do nó na árvore, 1-based; 0 se o nó não existir em nenhuma árvore. */
export function depthOf(nodeId: string, content: GameContent): number {
  const tree = treeOf(nodeId, content);
  return tree ? tree.nodes.indexOf(nodeId) + 1 : 0;
}

/** Quantos nós da árvore `treeId` estão ativos no estado. */
export function activeCount(state: GameState, treeId: string, content: GameContent): number {
  return state.activeNodes.filter((nodeId) => treeOf(nodeId, content)?.id === treeId).length;
}
