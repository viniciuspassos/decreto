import { INDICATOR_DYNAMICS, LEVEL_INDICATORS, type LevelIndicatorId } from "@decreto/game-content";
import type { Indicators } from "@decreto/shared-types";
import { over, type SemesterCtx } from "./common.js";

/** §3.2: escala do ruído, de 0 a 2. */
export function instability(ind: Indicators, recessionLevel: number): number {
  return Math.min(
    2,
    0.02 * over(ind.debt, 80) + 0.05 * over(ind.inflation, 10) + 0.02 * over(ind.crime, 50)
      + 0.02 * over(ind.corruption, 50) + 0.25 * recessionLevel,
  );
}

const atLeast = (value: number, threshold: number) => (value >= threshold ? 1 : 0);

/** §3.3: alvo de cada indicador, a partir dos valores exibidos do semestre anterior (acoplamentos). */
export function targets(i: Indicators, turnsInPower: number): Record<LevelIndicatorId, number> {
  return {
    gdp: 2 - 0.08 * over(i.inflation, 8) - 0.04 * over(i.corruption, 40) - 0.03 * over(i.crime, 50)
      + 0.03 * (i.education - 50) + 0.02 * (i.health - 50),
    unemployment: 8 - 1.5 * (i.gdp - 2),
    inflation: 4 + 0.06 * over(i.debt, 80) + 0.5 * over(i.gdp, 3.5) - 0.25 * over(i.unemployment, 12)
      + 0.05 * over(i.corruption, 50),
    crime: 35 + 2 * (i.unemployment - 9) + 0.3 * over(i.corruption, 40) - 0.25 * (i.education - 50),
    health: 50 - 0.25 * over(i.pollution, 55) - 0.5 * over(-i.gdp, 0) - 0.1 * over(i.debt, 120),
    education: 50 - 0.1 * over(i.debt, 120),
    pollution: 40 + 3 * over(i.gdp, 0),
    pressFreedom: 60,
    corruption: 35 + 0.5 * over(50, i.pressFreedom) + 0.1 * over(i.crime, 50)
      + 5 * atLeast(turnsInPower, 8) + 5 * atLeast(turnsInPower, 16),
  };
}

/** §3.1: reversão ao alvo + momento amortecido + ruído escalado pela instabilidade. */
export function updateBase({ state, rng }: SemesterCtx): void {
  const target = targets(state.indicators, state.turnsInPower);
  const noiseScale = 1 + instability(state.indicators, state.recessionLevel);
  const next = { ...state.base };
  LEVEL_INDICATORS.forEach((id) => {
    const { reversion, momentum, noise } = INDICATOR_DYNAMICS[id];
    const b = state.base[id];
    next[id] = b + reversion * (target[id] - b) + momentum * (b - state.previousBase[id]) + noise * noiseScale * rng.normal();
  });
  state.previousBase = state.base;
  state.base = next;
}
