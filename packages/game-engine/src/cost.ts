import type { GameState } from "@decreto/shared-types";
import { CAPITAL_COST_WEIGHTS, CRISIS_DISCOUNT, HONEYMOON, TAX_STEP_COST_BASE } from "@decreto/game-content";
import { activeCount, depthOf, treeOf, type GameContent } from "./trees.js";

export interface CostContext {
  state: GameState;
  content: GameContent;
}

export interface QueueCostContext extends CostContext {
  /** Victory margin ≥ 20 in the first semester of the term (design S3). */
  isHoneymoon: boolean;
  /** Flag de crise do semestre (game-design §3.9). */
  isCrisis: boolean;
}

/** 0 to 3: 0 = tree already active; 1 = nothing active in the field; 2 = another field tree active; 3 = opposite active. */
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

/** S3: cost to activate a toggle-tree node; does not apply to intensity trees. */
export function nodeCost(nodeId: string, ctx: CostContext): number {
  const { base, depth, distance } = CAPITAL_COST_WEIGHTS;
  return Math.round(base * (1 + depth * depthOf(nodeId, ctx.content) + distance * distanceOf(nodeId, ctx)));
}

/** S3/§1.4: cost to move an intensity policy (e.g. `taxRate`) in 10% increments. */
export function taxRateCost(currentRate: number, targetRate: number): number {
  const steps = Math.abs(targetRate - currentRate) / 10;
  return Math.round(TAX_STEP_COST_BASE * (1 + steps));
}

function isCrisisDiscounted(nodeId: string, content: GameContent): boolean {
  const field = treeOf(nodeId, content)?.field;
  return field !== undefined && (CRISIS_DISCOUNT.fields as readonly string[]).includes(field);
}

/**
 * Total cost of a node queue, in the order it would be applied. Order matters: the honeymoon
 * discounts only the first `HONEYMOON.discountedActions` in the queue, not a simple sum.
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
