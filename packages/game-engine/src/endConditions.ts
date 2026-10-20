import { LAST_TURN, TERMS_TO_WIN, TURNS_PER_TERM } from "@decreto/game-content";
import type { EndGameResult } from "@decreto/shared-types";
import type { EngineState } from "./types.js";

export type EndReason = EndGameResult["reason"];

/** Em ordem de prioridade: derrota por risco rolado, vitória por tempo no poder, limite de 40 anos. */
const checkers: ((state: EngineState) => EndReason | null)[] = [
  (state) => state.defeat,
  // 20 anos em turnos seguidos: vale também sob autoritarismo e monarquia, onde não há eleições ganhas.
  (state) => (state.turnsInPower >= TERMS_TO_WIN * TURNS_PER_TERM ? "twentyYears" : null),
  (state) => (state.turn > LAST_TURN ? "fortyYears" : null),
];

export function checkEnd(state: EngineState): EndReason | null {
  return checkers.map((check) => check(state)).find((reason) => reason !== null) ?? null;
}
