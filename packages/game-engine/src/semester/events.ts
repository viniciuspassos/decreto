import {
  EVENT_COUNT_ODDS, type Condition, type ConditionType, type GameEventDefinition, type EventTrigger, type IndicatorScale,
} from "@decreto/game-content";
import type { CountryEvent } from "@decreto/shared-types";
import type { EngineState } from "../state.js";
import { depthOf } from "../trees.js";
import { groupOf, isActive, type SemesterCtx, type StepCtx } from "./common.js";
import { applyEventEffects } from "./effects.js";

const threshold = (c: Condition) => c.threshold ?? 0;
const indicator = (c: Condition, s: EngineState) => (c.indicatorId ? s.indicators[c.indicatorId] : NaN);

/** Avaliador de cada tipo de condição de gatilho (§4.2). */
const CONDITIONS: Record<ConditionType, (c: Condition, s: EngineState) => boolean> = {
  nodeActive: (c, s) => isActive(s, c.nodeId ?? ""),
  anyNodeActive: (c, s) => (c.nodeIds ?? []).some((n) => isActive(s, n)),
  taxRateAtLeast: (c, s) => s.taxRate >= threshold(c),
  taxRateAtMost: (c, s) => s.taxRate <= threshold(c),
  indicatorAbove: (c, s) => indicator(c, s) > threshold(c),
  indicatorBelow: (c, s) => indicator(c, s) < threshold(c),
  approvalAbove: (c, s) => s.approval > threshold(c),
  approvalBelow: (c, s) => s.approval < threshold(c),
  groupSupportBelow: (c, s) => (groupOf(s, c.groupId ?? "")?.support ?? Infinity) < threshold(c),
  militaryMoodIn: (c, s) => (c.moods ?? []).includes(s.actors.military),
  recessionAtLeast: (c, s) => s.recessionLevel >= threshold(c),
  always: () => true,
};

export const conditionMet = (c: Condition, state: EngineState) => CONDITIONS[c.type](c, state);

function scaleFactor(scale: IndicatorScale | undefined, state: EngineState): number {
  if (!scale) return 1;
  return Math.min(3, 1 + Math.abs(state.indicators[scale.indicatorId] - scale.threshold) / scale.range);
}

/** "Fresco": nó do gatilho ativado neste semestre pesa `1 + 0,5 × profundidade` (§1.3). */
function freshFactor(trigger: EventTrigger, applied: string[], ctx: StepCtx): number {
  const fresh = trigger.conditions.flatMap((c) => [c.nodeId ?? "", ...(c.nodeIds ?? [])]).filter((n) => applied.includes(n));
  if (fresh.length === 0) return 1;
  return 1 + 0.5 * Math.max(...fresh.map((n) => depthOf(n, ctx.content)));
}

function triggerWeight(trigger: EventTrigger, applied: string[], ctx: StepCtx): number {
  const { state } = ctx;
  if (!trigger.conditions.every((c) => conditionMet(c, state))) return 0;
  const extra = trigger.conditionalMultiplier;
  const multiplier = extra && conditionMet(extra.condition, state) ? extra.factor : 1;
  return trigger.weight * scaleFactor(trigger.scale, state) * multiplier * freshFactor(trigger, applied, ctx);
}

function offCooldown(def: GameEventDefinition, state: EngineState): boolean {
  const last = state.eventTurns[def.id];
  if (last === undefined) return true;
  return def.cooldown !== "once" && state.turn - last >= def.cooldown;
}

const hasAlwaysTrigger = (def: GameEventDefinition) => def.triggers.some((t) => t.conditions.some((c) => c.type === "always"));

/** Antimonotonia: positivo pesa ×1,5 se nenhum positivo saiu nos últimos 2 semestres. */
function antiMonotony(def: GameEventDefinition, state: EngineState): number {
  const last = state.lastPositiveEventTurn;
  return def.tone === "positive" && (last === null || state.turn - last > 2) ? 1.5 : 1;
}

/** Peso efetivo do evento neste semestre; 0 = não pode sair (§4.2–§4.3). */
export function eventWeight(def: GameEventDefinition, applied: string[], ctx: StepCtx, ignoreCooldown = false): number {
  const { state } = ctx;
  if (def.blockedByNode && isActive(state, def.blockedByNode)) return 0;
  if (!offCooldown(def, state) && !(ignoreCooldown && hasAlwaysTrigger(def))) return 0;
  const weight = Math.max(0, ...def.triggers.map((t) => triggerWeight(t, applied, ctx)));
  return weight * antiMonotony(def, state);
}

interface Candidate {
  def: GameEventDefinition;
  weight: number;
}

function candidates(applied: string[], ctx: StepCtx, ignoreCooldown: boolean): Candidate[] {
  return ctx.content.events
    .map((def) => ({ def, weight: eventWeight(def, applied, ctx, ignoreCooldown) }))
    .filter((c) => c.weight > 0);
}

/** 1, 2 ou 3 eventos com as probabilidades do §4.1. */
export function rollEventCount(rng: SemesterCtx["rng"]): number {
  let r = rng.next();
  const odds = EVENT_COUNT_ODDS.find((o) => (r -= o.probability) < 0);
  return (odds ?? EVENT_COUNT_ODDS[EVENT_COUNT_ODDS.length - 1]).count;
}

function pickIndex(pool: Candidate[], rng: SemesterCtx["rng"]): number {
  let r = rng.next() * pool.reduce((sum, c) => sum + c.weight, 0);
  const index = pool.findIndex((c) => (r -= c.weight) < 0);
  return index === -1 ? pool.length - 1 : index;
}

function fire(ctx: StepCtx, def: GameEventDefinition, image: boolean): CountryEvent {
  const { state } = ctx;
  applyEventEffects(state, def.effects);
  state.eventTurns[def.id] = state.turn;
  if (def.crisis) state.lastCrisisTurn = state.turn;
  if (def.tone === "positive") state.lastPositiveEventTurn = state.turn;
  if (def.options) state.pendingChoices.push({ eventId: def.id, turn: state.turn });
  return { id: def.id, turn: state.turn, pending: def.options !== undefined, image };
}

/**
 * Sorteio ponderado sem reposição (§4.3); só o evento marcante de maior peso mostra imagem.
 * Se nenhum evento for elegível, ignora o cooldown dos eventos "sempre" (nunca zero eventos).
 */
export function drawEvents(ctx: SemesterCtx, applied: string[]): CountryEvent[] {
  const regular = candidates(applied, ctx, false);
  const pool = regular.length > 0 ? regular : candidates(applied, ctx, true);
  const count = rollEventCount(ctx.rng);
  const picked: Candidate[] = [];
  while (picked.length < count && pool.length > 0) picked.push(...pool.splice(pickIndex(pool, ctx.rng), 1));
  const withImage = picked.filter((c) => c.def.milestone).sort((a, b) => b.weight - a.weight)[0];
  return picked.map((c) => fire(ctx, c.def, c === withImage));
}
