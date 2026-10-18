import type { CountryEvent } from "@decreto/shared-types";
import type { StepCtx } from "./common.js";
import { applyEventEffects } from "./effects.js";

/** Evento gerado pelo motor (§5.2): não conta na cota do semestre e não é sorteado. */
export function systemEvent(ctx: StepCtx, id: string): CountryEvent {
  const { state } = ctx;
  const def = ctx.content.systemEvents.find((e) => e.id === id);
  if (def?.effects) applyEventEffects(state, def.effects);
  if (def?.crisis) state.lastCrisisTurn = state.turn;
  return { id, turn: state.turn, pending: false, image: def?.milestone === true };
}
