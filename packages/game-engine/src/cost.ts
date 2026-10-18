import type { GameState } from "@decreto/shared-types";
import { CAPITAL_COST_WEIGHTS, CRISIS_DISCOUNT, HONEYMOON, TAX_STEP_COST_BASE } from "@decreto/game-content";
import { activeCount, depthOf, treeOf, type GameContent } from "./trees.js";

export interface CostContext {
  state: GameState;
  content: GameContent;
}

export interface QueueCostContext extends CostContext {
  /** Margem de vitória ≥ 20 no primeiro semestre do mandato (roteiro S3). */
  isHoneymoon: boolean;
  /** Flag de crise do semestre (game-design §3.9). */
  isCrisis: boolean;
}

/** 0 a 3: 0 = árvore já ativa; 1 = campo sem nada ativo; 2 = outra árvore do campo ativa; 3 = oposta ativa. */
function distanceOf(nodeId: string, ctx: CostContext): number {
  const tree = treeOf(nodeId, ctx.content);
  if (!tree) return 0;
  if (activeCount(ctx.state, tree.id, ctx.content) > 0) return 0;
  const fieldHasActive = ctx.content.policyTrees.some(
    (t) => t.field === tree.field && t.id !== tree.id && activeCount(ctx.state, t.id, ctx.content) > 0,
  );
  if (!fieldHasActive) return 1;
  const oppositeActive = tree.opposite !== undefined && activeCount(ctx.state, tree.opposite, ctx.content) > 0;
  return oppositeActive ? 3 : 2;
}

/** S3: custo de ativar um nó de árvore liga/desliga — não serve para árvores de intensidade. */
export function nodeCost(nodeId: string, ctx: CostContext): number {
  const { base, depth, distance } = CAPITAL_COST_WEIGHTS;
  return Math.round(base * (1 + depth * depthOf(nodeId, ctx.content) + distance * distanceOf(nodeId, ctx)));
}

/** S3/§1.4: custo de mover uma política de intensidade (ex.: `taxRate`) em faixas de 10%. */
export function taxRateCost(currentRate: number, targetRate: number): number {
  const steps = Math.abs(targetRate - currentRate) / 10;
  return Math.round(TAX_STEP_COST_BASE * (1 + steps));
}

function isCrisisDiscounted(nodeId: string, content: GameContent): boolean {
  const field = treeOf(nodeId, content)?.field;
  return field !== undefined && (CRISIS_DISCOUNT.fields as readonly string[]).includes(field);
}

/**
 * Custo total de uma fila de nós, na ordem em que seriam aplicados. Depende da ordem: lua de mel
 * só desconta as primeiras `HONEYMOON.discountedActions` da fila, não uma soma simples.
 */
export function queueCost(nodeIds: string[], ctx: QueueCostContext): number {
  let honeymoonLeft = ctx.isHoneymoon ? HONEYMOON.discountedActions : 0;
  return nodeIds.reduce((total, nodeId) => {
    let cost = nodeCost(nodeId, ctx);
    if (honeymoonLeft > 0) {
      cost *= HONEYMOON.discount;
      honeymoonLeft -= 1;
    }
    if (ctx.isCrisis && isCrisisDiscounted(nodeId, ctx.content)) {
      cost *= 1 - CRISIS_DISCOUNT.discount;
    }
    return total + Math.round(cost);
  }, 0);
}
