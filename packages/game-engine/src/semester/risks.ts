import { COUP_MOOD_BASE, REVOLUTION_MOOD_MULTIPLIER } from "@decreto/game-content";
import type { CountryEvent, RiskId } from "@decreto/shared-types";
import type { Defeat } from "../state.js";
import { clamp, countActive, effectTotal, over, sizeOf, type SemesterCtx, type StepCtx } from "./common.js";
import { systemEvent } from "./system-events.js";

/** `ate×0,7` (empilha) e redução da chance fatal (−10 pp cada), por id de nó (§3.7). */
const ATTACK_SHIELD_NODES = ["secret-police", "mass-surveillance"];
const FATAL_SHIELD_NODES = ["military-on-streets", "secret-police", "mass-surveillance"];

const eventRisk = (ctx: StepCtx, id: RiskId) => ctx.state.eventRisks[id] ?? 0;

/** Tentativa de atentado, % por semestre. */
export function attackRisk(ctx: StepCtx): number {
  const { state } = ctx;
  const desperate = state.groups.filter((g) => g.support !== null && g.support < 15 && g.size >= 5).length;
  const raw = 0.8 * sizeOf(state, "revolutionaries") + desperate + effectTotal(ctx, "attackRisk") + eventRisk(ctx, "attack");
  return clamp(raw * 0.7 ** countActive(state, ATTACK_SHIELD_NODES), 0, 25);
}

/** Chance de uma tentativa de atentado ser fatal, %. */
export function fatalChance(ctx: StepCtx): number {
  return Math.max(10, 35 - 10 * countActive(ctx.state, FATAL_SHIELD_NODES));
}

export function revolutionRisk(ctx: StepCtx): number {
  const { state } = ctx;
  const revolutionaries = sizeOf(state, "revolutionaries");
  if (revolutionaries < 5) return 0;
  const raw = 1.5 * (revolutionaries - 5) + 0.3 * over(35, state.approval) + 0.5 * sizeOf(state, "rebels")
    + effectTotal(ctx, "revolutionRisk") + eventRisk(ctx, "revolution");
  return clamp(raw * REVOLUTION_MOOD_MULTIPLIER[state.actors.military], 0, 40);
}

export function coupRisk(ctx: StepCtx): number {
  const { state } = ctx;
  const raw = COUP_MOOD_BASE[state.actors.military] + 0.4 * over(35, state.approval) + 2 * state.recessionLevel
    + 0.5 * sizeOf(state, "rebels") + effectTotal(ctx, "coupRisk") + eventRisk(ctx, "coup");
  const risk = clamp(raw, 0, 50);
  return state.actors.military === "loyal" ? Math.min(risk, 3) : risk;
}

/** Riscos do semestre (§3.7); `rebels` é o tamanho atual do grupo. */
export function risksOf(ctx: StepCtx): Record<RiskId, number> {
  return { attack: attackRisk(ctx), revolution: revolutionRisk(ctx), coup: coupRisk(ctx), rebels: sizeOf(ctx.state, "rebels") };
}

function defeat(ctx: SemesterCtx, reason: Defeat, eventId: string): CountryEvent {
  ctx.state.defeat = reason;
  return systemEvent(ctx, eventId);
}

/** Rola atentado → revolução → golpe; a primeira derrota encerra a rolagem. */
export function rollRisks(ctx: SemesterCtx, risks: Record<RiskId, number>): CountryEvent[] {
  const roll = (percent: number) => ctx.rng.next() * 100 < percent;
  const events: CountryEvent[] = [];
  if (roll(risks.attack)) {
    if (roll(fatalChance(ctx))) return [defeat(ctx, "attack", "attack-fatal")];
    events.push(systemEvent(ctx, "attack-foiled"));
  }
  if (roll(risks.revolution)) return [...events, defeat(ctx, "revolution", "revolution")];
  if (roll(risks.coup)) return [...events, defeat(ctx, "coup", "coup")];
  return events;
}
