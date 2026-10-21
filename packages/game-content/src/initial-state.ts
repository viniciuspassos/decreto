import type { Indicators, InitialSituation } from "@decreto/shared-types";
import { TAX_RATES } from "./rules.js";

/** New-game indicators for the `unstable` situation (game-design §1.5). */
export const BASE_INDICATORS: Indicators = {
  gdp: 1.8, unemployment: 9.4, inflation: 6.1, debt: 74, crime: 38,
  health: 52, education: 49, pollution: 44, pressFreedom: 58, corruption: 36,
};

/** Offsets applied to `BASE_INDICATORS` for each starting situation. */
export const SITUATIONS: Record<InitialSituation, Partial<Indicators>> = {
  stable: { gdp: 2.6, unemployment: 6.2, inflation: 3.8, debt: 48 },
  unstable: {},
  crisis: { gdp: -2.1, unemployment: 14.5, inflation: 12.3, debt: 96, crime: 55 },
};

/** Tax rate inherited upon taking office: already active and not a player policy. */
export const INITIAL_TAX_RATE: (typeof TAX_RATES)[number] = 30;
