import { LAST_TURN, TERMS_TO_WIN, TURNS_PER_TERM } from "@decreto/game-content";
import type { EndGameResult } from "@decreto/shared-types";
import type { EngineState } from "./types.js";

export type EndReason = EndGameResult["reason"];

/** In priority order: defeat from a rolled risk, victory from time in power, 40-year limit. */
const checkers: ((state: EngineState) => EndReason | null)[] = [
  (state) => state.defeat,
  // 20 consecutive years in power; also applies under authoritarianism and monarchy, where elections are not won.
  (state) => (state.turnsInPower >= TERMS_TO_WIN * TURNS_PER_TERM ? "twentyYears" : null),
  (state) => (state.turn > LAST_TURN ? "fortyYears" : null),
];

export function checkEnd(state: EngineState): EndReason | null {
  return checkers.map((check) => check(state)).find((reason) => reason !== null) ?? null;
}
