import type { Indicators, InitialSituation } from "@decreto/shared-types";
import { TAX_RATES } from "./rules.js";

/** Indicadores de partida nova, situação `unstable` (roteiro, game-design §1.5). */
export const BASE_INDICATORS: Indicators = {
  gdp: 1.8, unemployment: 9.4, inflation: 6.1, debt: 74, crime: 38,
  health: 52, education: 49, pollution: 44, pressFreedom: 58, corruption: 36,
};

/** Deslocamentos aplicados sobre `BASE_INDICATORS` por situação inicial. */
export const SITUATIONS: Record<InitialSituation, Partial<Indicators>> = {
  stable: { gdp: 2.6, unemployment: 6.2, inflation: 3.8, debt: 48 },
  unstable: {},
  crisis: { gdp: -2.1, unemployment: 14.5, inflation: 12.3, debt: 96, crime: 55 },
};

/** Alíquota de imposto herdada ao tomar posse: já ativa, não é política do jogador. */
export const INITIAL_TAX_RATE: (typeof TAX_RATES)[number] = 30;
