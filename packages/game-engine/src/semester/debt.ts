import { RECESSION_LEVELS } from "@decreto/game-content";
import type { CountryEvent } from "@decreto/shared-types";
import { clampIndicator, displayedIndicators, effectTotal, over, sizeOf, type StepCtx } from "./common.js";
import { systemEvent } from "./system-events.js";

/** Déficit primário estrutural com imposto a 30% (§3.4). */
const STRUCTURAL_DEFICIT = 0.3;

/** §3.4: dívida é estoque — déficit primário + juros reais sobre o estoque + `Dív 1×` dos nós recém-ativados. */
export function updateDebt(ctx: StepCtx, applied: string[]): void {
  const { state, content } = ctx;
  const { debt, gdp, corruption } = state.indicators;
  const deficit = STRUCTURAL_DEFICIT + effectTotal(ctx, "debtPerSemester")
    + 0.5 * state.recessionLevel + 0.05 * sizeOf(state, "rebels");
  const realInterest = 3 + 0.04 * over(debt, 80) + 0.05 * over(corruption, 50);
  const once = applied.reduce((sum, n) => sum + (content.nodeEffects[n]?.debtOnce ?? 0), 0);
  state.indicators.debt = clampIndicator("debt", debt + deficit + (debt * (realInterest - gdp)) / 200 + once);
}

/** Nível de recessão com histerese: entra pelo limiar de entrada e só sai abaixo do de saída (§3.4). */
export function nextRecessionLevel(current: number, debt: number, preRecessionGdp: number): number {
  const holds = RECESSION_LEVELS.filter((r) => {
    const gdpLow = r.enterGdp !== undefined && preRecessionGdp < r.enterGdp;
    const enters = debt >= r.enterDebt || gdpLow;
    const stays = r.level <= current && (debt >= r.exitDebt || gdpLow);
    return enters || stays;
  });
  return Math.max(0, ...holds.map((r) => r.level));
}

/** Atualiza o nível de recessão e recalcula os indicadores exibidos; devolve `recession-starts/ends`. */
export function updateRecession(ctx: StepCtx): CountryEvent[] {
  const { state } = ctx;
  const previous = state.recessionLevel;
  const preRecessionGdp = state.base.gdp + effectTotal(ctx, "gdp");
  state.recessionLevel = nextRecessionLevel(previous, state.indicators.debt, preRecessionGdp);
  state.indicators = displayedIndicators(ctx);
  if (previous === 0 && state.recessionLevel > 0) return [systemEvent(ctx, "recession-starts")];
  if (previous > 0 && state.recessionLevel === 0) return [systemEvent(ctx, "recession-ends")];
  return [];
}
