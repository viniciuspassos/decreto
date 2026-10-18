import {
  GROUP_SIZE_LIMITS, INDICATOR_RANGES, LEVEL_INDICATORS, type LevelIndicatorId, type NodeEffect,
} from "@decreto/game-content";
import type { GroupState, IndicatorId, Indicators } from "@decreto/shared-types";
import type { SemesterContent } from "../content.js";
import type { Rng } from "../rng.js";
import type { EngineState } from "../types.js";

/**
 * Contexto de cada passo do semestre. `endSemester` clona o estado de entrada uma vez e os passos
 * alteram esse rascunho na ordem do game-design §3 — a função pública continua pura.
 */
export interface StepCtx {
  state: EngineState;
  content: SemesterContent;
}

export interface SemesterCtx extends StepCtx {
  rng: Rng;
}

type NumericEffect = Exclude<keyof NodeEffect, "groupSizeOnce" | "groupSizePerSemester" | "mediaFloor">;

/** O estado é JSON por contrato (vai para `jsonb`), então a cópia profunda por JSON é exata. */
export const cloneState = (state: EngineState) => JSON.parse(JSON.stringify(state)) as EngineState;

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
/** `max(0, valor − limiar)`: o "excesso" usado em quase todas as fórmulas do game-design. */
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

/** Efeitos de todos os nós ativos + a linha da alíquota corrente (§1.2, §1.4). */
export function activeEffects({ state, content }: StepCtx): NodeEffect[] {
  return [...state.activeNodes.flatMap((n) => content.nodeEffects[n] ?? []), content.taxRateEffects[state.taxRate]];
}

export function effectTotal(ctx: StepCtx, key: NumericEffect): number {
  return activeEffects(ctx).reduce((sum, effect) => sum + (effect[key] ?? 0), 0);
}

/** Produto de um multiplicador dos nós ativos (ausente = 1). */
export function effectProduct(ctx: StepCtx, key: "attackRiskMultiplier" | "rebelGrowthMultiplier"): number {
  return activeEffects(ctx).reduce((product, effect) => product * (effect[key] ?? 1), 1);
}

export function clampIndicator(id: IndicatorId, value: number): number {
  const [min, max] = INDICATOR_RANGES[id];
  return clamp(value, min, max);
}

/** §3.4: recessão e rebeldes deslocam o valor exibido, não a base. */
const RECESSION_SHIFT: Partial<Record<LevelIndicatorId, number>> = { gdp: -1, unemployment: 1.5 };
const REBELS_SHIFT: Partial<Record<LevelIndicatorId, number>> = { crime: 1, gdp: -0.1 };

/** §1.2: `exibido = clamp(base + políticas + recessão + rebeldes)`; `debt` é estoque e fica como está. */
export function displayedIndicators(ctx: StepCtx): Indicators {
  const { state } = ctx;
  const rebels = sizeOf(state, "rebels");
  const levels = LEVEL_INDICATORS.map((id) => {
    const shift = effectTotal(ctx, id) + (RECESSION_SHIFT[id] ?? 0) * state.recessionLevel + (REBELS_SHIFT[id] ?? 0) * rebels;
    return [id, clampIndicator(id, state.base[id] + shift)] as const;
  });
  return { ...(Object.fromEntries(levels) as Record<LevelIndicatorId, number>), debt: state.indicators.debt };
}
