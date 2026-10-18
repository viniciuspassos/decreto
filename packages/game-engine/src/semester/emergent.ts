import type { CountryEvent } from "@decreto/shared-types";
import { addSize, effectProduct, effectTotal, sizeOf, type StepCtx } from "./common.js";
import { systemEvent } from "./system-events.js";

/** Crescimento de rebeldes por nível de recessão (0 a 3). */
const REBEL_GROWTH = [-0.5, -0.5, 0.5, 1.0];

const flag = (condition: boolean) => (condition ? 1 : 0);

export function revolutionaryGrowth(ctx: StepCtx): number {
  const { state } = ctx;
  return effectTotal(ctx, "revolutionaryGrowth") + 0.5 * flag(state.approval < 30) + 0.3 * state.recessionLevel
    + 0.3 * flag(state.indicators.unemployment > 15) - 0.3 * flag(state.approval > 55) - 0.2;
}

export function rebelGrowth(ctx: StepCtx): number {
  const growth = REBEL_GROWTH[ctx.state.recessionLevel] ?? 0;
  return growth > 0 ? growth * effectProduct(ctx, "rebelGrowthMultiplier") : growth;
}

/** §3.8: revolucionários e rebeldes; a primeira vez que surgem rebeldes gera `rebels-emerge`. */
export function updateEmergent(ctx: StepCtx): CountryEvent[] {
  const { state } = ctx;
  addSize(state, "revolutionaries", revolutionaryGrowth(ctx));
  addSize(state, "rebels", rebelGrowth(ctx));
  if (state.rebelsEmerged || sizeOf(state, "rebels") <= 0) return [];
  state.rebelsEmerged = true;
  return [systemEvent(ctx, "rebels-emerge")];
}
