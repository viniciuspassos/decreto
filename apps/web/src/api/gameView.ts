import { policyTrees } from "@decreto/game-content";
import type { GameView, NodeStatus, QueuePreview } from "@decreto/shared-types";

export interface PlayableGame extends GameView {
  queue: string[];
  preview: QueuePreview | null;
}

export function playableGame(game: GameView): PlayableGame {
  return { ...game, queue: [], preview: null };
}

export function nodeStatus(game: PlayableGame, nodeId: string): NodeStatus {
  if (game.queue.includes(nodeId)) return "queued";
  return game.preview?.nodes[nodeId]?.status ?? game.nodes[nodeId]?.status ?? "blocked";
}

export function nodeCost(game: PlayableGame, nodeId: string): number | null {
  const previewNode = game.preview?.nodes[nodeId];
  return previewNode ? previewNode.cost : game.nodes[nodeId]?.cost ?? null;
}

export function queueCost(game: PlayableGame): number {
  return game.preview?.totalCost ?? 0;
}

export function treeOf(nodeId: string) {
  return policyTrees.find((tree) => tree.nodes.includes(nodeId));
}

export function depthOf(nodeId: string): number {
  return (treeOf(nodeId)?.nodes.indexOf(nodeId) ?? -1) + 1;
}

export function activeCount(game: PlayableGame, treeId: string): number {
  return game.activeNodes.filter((nodeId) => treeOf(nodeId)?.id === treeId).length;
}
