import {
  GROUP_SIZE_LIMITS, INDICATOR_RANGES, LEVEL_INDICATORS, type LevelIndicatorId, type NodeEffect,
} from "@decreto/game-content";
import type { GroupState, IndicatorId, Indicators } from "@decreto/shared-types";
import type { SemesterContent } from "../content.js";
import type { Rng } from "../rng.js";
import type { EngineState } from "../types.js";

/**
 * Context for each semester step. `endSemester` clones the input state once, and the steps
 * modify this draft in game-design §3 order; the public function remains pure.
 */
export interface StepCtx {
  state: EngineState;
  content: SemesterContent;
}

export interface SemesterCtx extends StepCtx {
  rng: Rng;
}

type NumericEffect = Exclude<keyof NodeEffect, "groupSizeOnce" | "groupSizePerSemester" | "mediaFloor">;

/** The state is JSON by contract (stored in `jsonb`), so a JSON deep copy is exact. */
export const cloneState = (state: EngineState) => JSON.parse(JSON.stringify(state)) as EngineState;

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
/** `max(0, value − threshold)`: the "excess" used in most game-design formulas. */
export const over = (value: number, threshold: number) => Math.max(0, value - threshold);

export const isActive = (state: EngineState, nodeId: string) => state.activeNodes.includes(nodeId);
export const countActive = (state: EngineState, nodeIds: string[]) => nodeIds.filter((n) => isActive(state, n)).length;

export function groupOf(state: EngineState, groupId: string): GroupState | undefined {
  return state.groups.find((g) => g.id === groupId);
}

export const sizeOf = (state: EngineState, groupId: string) => groupOf(state, groupId)?.size ?? 0;

export function addSize(state: EngineState, groupId: string, delta: number): void {
  const group = groupOf(state, groupId);
  if (!group) return;
  const [min, max] = GROUP_SIZE_LIMITS[groupId] ?? [0, 100];
  group.size = clamp(group.size + delta, min, max);
}

/** Effects of all active nodes + the current tax rate row (§1.2, §1.4). */
export function activeEffects({ state, content }: StepCtx): NodeEffect[] {
  return [...state.activeNodes.flatMap((n) => content.nodeEffects[n] ?? []), content.taxRateEffects[state.taxRate]];
}

export function effectTotal(ctx: StepCtx, key: NumericEffect): number {
  return activeEffects(ctx).reduce((sum, effect) => sum + (effect[key] ?? 0), 0);
}

/** Product of a multiplier from active nodes (missing = 1). */
export function effectProduct(ctx: StepCtx, key: "attackRiskMultiplier" | "rebelGrowthMultiplier"): number {
  return activeEffects(ctx).reduce((product, effect) => product * (effect[key] ?? 1), 1);
}

export function clampIndicator(id: IndicatorId, value: number): number {
  const [min, max] = INDICATOR_RANGES[id];
  return clamp(value, min, max);
}

/** §3.4: recession and rebels shift the displayed value, not the baseline. */
const RECESSION_SHIFT: Partial<Record<LevelIndicatorId, number>> = { gdp: -1, unemployment: 1.5 };
const REBELS_SHIFT: Partial<Record<LevelIndicatorId, number>> = { crime: 1, gdp: -0.1 };

/** §1.2: `displayed = clamp(base + policies + recession + rebels)`; `debt` is a stock and remains unchanged. */
export function displayedIndicators(ctx: StepCtx): Indicators {
  const { state } = ctx;
  const rebels = sizeOf(state, "rebels");
  const levels = LEVEL_INDICATORS.map((id) => {
    const shift = effectTotal(ctx, id) + (RECESSION_SHIFT[id] ?? 0) * state.recessionLevel + (REBELS_SHIFT[id] ?? 0) * rebels;
    return [id, clampIndicator(id, state.base[id] + shift)] as const;
  });
  return { ...(Object.fromEntries(levels) as Record<LevelIndicatorId, number>), debt: state.indicators.debt };
}
