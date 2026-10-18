import { MAX_ACTIONS, POLICY_REACTION } from "@decreto/game-content";
import type { EngineState } from "../types.js";
import { nodeStatus } from "../availability.js";
import { queueCost, taxRateCost } from "../cost.js";
import { treeOf } from "../trees.js";
import { addSize, clamp, groupOf, type StepCtx } from "./common.js";

export type QueueErrorCode = "duplicate" | "unavailable" | "tooManyActions" | "insufficientCapital";

export interface QueueError {
  code: QueueErrorCode;
  nodeId?: string;
}

/** Nós da fila + o ajuste de alíquota, que conta como 1 ação (§1.4). */
export const queuedActions = (state: EngineState) => state.queue.length + (state.queuedTaxRate === null ? 0 : 1);

export function queueTotalCost({ state, content }: StepCtx): number {
  const nodes = queueCost(state.queue, { state, content, isHoneymoon: state.honeymoon, isCrisis: state.crisis });
  return nodes + (state.queuedTaxRate === null ? 0 : taxRateCost(state.taxRate, state.queuedTaxRate));
}

/** Cada nó precisa estar disponível considerando o resto da fila (opostas enfileiradas se bloqueiam). */
function nodeErrors({ state, content }: StepCtx): QueueError[] {
  return state.queue.flatMap((nodeId, i): QueueError[] => {
    if (state.queue.indexOf(nodeId) !== i) return [{ code: "duplicate", nodeId }];
    const others = { ...state, queue: state.queue.filter((n) => n !== nodeId) };
    const available = !treeOf(nodeId, content)?.intensity && nodeStatus(nodeId, { state: others, content }) === "available";
    return available ? [] : [{ code: "unavailable", nodeId }];
  });
}

/** Pré-requisitos, opostas, máximo de ações e capital suficiente; lista vazia = fila válida. */
export function validateQueue(ctx: StepCtx): QueueError[] {
  const errors = nodeErrors(ctx);
  if (ctx.state.queuedTaxRate === ctx.state.taxRate) errors.push({ code: "unavailable", nodeId: "taxes" });
  if (queuedActions(ctx.state) > MAX_ACTIONS) errors.push({ code: "tooManyActions" });
  if (queueTotalCost(ctx) > ctx.state.capital) errors.push({ code: "insufficientCapital" });
  return errors;
}

/** ±4 para quem gosta/não gosta da árvore; `direction` −1 inverte (baixar imposto). */
function reactToTree(ctx: StepCtx, treeId: string, direction: number, nodeId?: string): void {
  ctx.content.voterGroups.forEach((g) => {
    const sign = (g.likes.includes(treeId) ? 1 : 0) - (g.dislikes.includes(treeId) ? 1 : 0);
    const group = groupOf(ctx.state, g.id);
    if (sign === 0 || !group || group.support === null) return;
    group.support = clamp(group.support + sign * direction * POLICY_REACTION, 0, 100);
    if (nodeId) group.memory = nodeId;
  });
}

function activate(ctx: StepCtx, nodeId: string): void {
  reactToTree(ctx, treeOf(nodeId, ctx.content)?.id ?? "", 1, nodeId);
  ctx.content.nodeEffects[nodeId]?.groupSizeOnce?.forEach(({ groupId, multiplier }) => {
    const group = groupOf(ctx.state, groupId);
    if (group) addSize(ctx.state, groupId, group.size * (multiplier - 1));
  });
}

/** Passo 1 do §3: paga a fila, ativa os nós, muda a alíquota; devolve os nós ativados. */
export function applyQueue(ctx: StepCtx): string[] {
  const { state } = ctx;
  const applied = state.queue;
  state.capital -= queueTotalCost(ctx);
  state.activeNodes = [...state.activeNodes, ...applied];
  applied.forEach((nodeId) => activate(ctx, nodeId));
  if (state.queuedTaxRate !== null) {
    reactToTree(ctx, "taxes", Math.sign(state.queuedTaxRate - state.taxRate));
    state.taxRate = state.queuedTaxRate;
  }
  state.queue = [];
  state.queuedTaxRate = null;
  return applied;
}
