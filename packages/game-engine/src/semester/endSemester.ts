import { CAPITAL_PER_APPROVAL } from "@decreto/game-content";
import type { CountryEvent, RiskId, SemesterReport } from "@decreto/shared-types";
import type { SemesterContent } from "../content.js";
import { createRng } from "../rng.js";
import type { EngineState } from "../types.js";
import { updateMoods } from "./actors.js";
import { resolveDefaultChoices, refresh } from "./choices.js";
import { cloneState, type SemesterCtx } from "./common.js";
import { updateDebt, updateRecession } from "./debt.js";
import { updateEmergent } from "./emergent.js";
import { drawEvents } from "./events.js";
import { loyaltyOf, updateSizes, updateSupport } from "./groups.js";
import { updateBase } from "./movement.js";
import { applyQueue, validateQueue, type QueueError } from "./queue.js";
import { risksOf, rollRisks } from "./risks.js";
import { skipElectionIfSuspended } from "./term.js";

export class InvalidQueueError extends Error {
  constructor(readonly errors: QueueError[]) {
    super(`invalid queue: ${errors.map((e) => e.code).join(", ")}`);
  }
}

/** Capital ganho por semestre: só a aprovação conta (roteiro §4.21). */
export const capitalGain = (approval: number) => Math.round(approval * CAPITAL_PER_APPROVAL);

/** §3.9: crise por recessão ≥ 2 ou por evento de crise neste semestre ou no anterior. */
function isCrisis(state: EngineState): boolean {
  const recentEvent = state.lastCrisisTurn !== null && state.turn - state.lastCrisisTurn <= 1;
  return state.recessionLevel >= 2 || recentEvent;
}

/** Passo 11 do §3 + virada de turno: crise, decaimento, capital pela aprovação **nova**, delta dos grupos. */
function closeSemester(ctx: SemesterCtx, before: EngineState): void {
  const { state } = ctx;
  state.crisis = isCrisis(state);
  state.moodMods = { media: state.moodMods.media * 0.5, military: state.moodMods.military * 0.5 };
  state.eventRisks = {};
  state.honeymoon = false;
  state.capitalPerTurn = capitalGain(state.approval);
  state.capital += state.capitalPerTurn;
  state.groups.forEach((g) => {
    const old = before.groups.find((b) => b.id === g.id)?.support ?? null;
    g.delta = g.support === null || old === null ? 0 : g.support - old;
    g.loyalty = loyaltyOf(g.support);
  });
  state.turn += 1;
  state.turnsInPower += 1;
  skipElectionIfSuspended(state);
  state.seed = ctx.rng.seed();
}

interface SemesterOutcome {
  applied: string[];
  risks: Record<RiskId, number>;
  events: CountryEvent[];
}

function buildReport(before: EngineState, after: EngineState, { applied, risks, events }: SemesterOutcome): SemesterReport {
  return {
    applied,
    approvalBefore: before.approval,
    capitalBefore: before.capital,
    indicatorsBefore: before.indicators,
    groupChanges: after.groups.filter((g) => g.delta !== 0).map((g) => ({ id: g.id, delta: g.delta })),
    risks,
    events,
  };
}

/**
 * Fecha o semestre na ordem do game-design §3 (função pura: o estado de entrada não é alterado).
 * Escolhas de evento em aberto valem como resolvidas no início do turno (§4.4), antes da fila.
 * Lança `InvalidQueueError` se a fila não for válida. Mesma seed + mesmo estado ⇒ mesmo resultado.
 */
export function endSemester(input: EngineState, content: SemesterContent): { state: EngineState; report: SemesterReport } {
  if (input.defeat) throw new Error(`game over: ${input.defeat}`);
  const state = cloneState(input);
  const ctx: SemesterCtx = { state, content, rng: createRng(state.seed) };
  resolveDefaultChoices(ctx);
  const errors = validateQueue(ctx);
  if (errors.length > 0) throw new InvalidQueueError(errors);
  const applied = applyQueue(ctx);
  updateBase(ctx);
  updateDebt(ctx, applied);
  const events = updateRecession(ctx);
  updateSizes(ctx);
  updateSupport(ctx);
  updateMoods(ctx);
  events.push(...updateEmergent(ctx), ...drawEvents(ctx, applied));
  refresh(ctx);
  const risks = risksOf(ctx);
  events.push(...rollRisks(ctx, risks));
  refresh(ctx);
  closeSemester(ctx, input);
  return { state, report: buildReport(input, state, { applied, risks, events }) };
}
