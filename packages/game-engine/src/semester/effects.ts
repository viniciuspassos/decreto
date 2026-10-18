import { LEVEL_INDICATORS, MEDIA_NEGATIVE_EVENT_MULTIPLIER, type EventEffects, type LevelIndicatorId } from "@decreto/game-content";
import type { IndicatorId, RiskId } from "@decreto/shared-types";
import type { EngineState } from "../state.js";
import { addSize, clamp, clampIndicator } from "./common.js";

const isLevel = (id: IndicatorId): id is LevelIndicatorId => (LEVEL_INDICATORS as IndicatorId[]).includes(id);

/** Choque na base (decai por reversão e tem momento); `debt` soma direto no estoque. */
function applyShocks(state: EngineState, shocks: Partial<Record<IndicatorId, number>>): void {
  (Object.entries(shocks) as [IndicatorId, number][]).forEach(([id, delta]) => {
    if (isLevel(id)) state.base[id] += delta;
    else state.indicators.debt = clampIndicator("debt", state.indicators.debt + delta);
  });
}

/** Deltas de apoio; os negativos são ampliados ou amortecidos pelo humor da mídia (§3.6). */
function applySupport(state: EngineState, effects: EventEffects): void {
  const multiplier = MEDIA_NEGATIVE_EVENT_MULTIPLIER[state.actors.media];
  const scaled = (delta: number) => (delta < 0 ? delta * multiplier : delta);
  state.groups.forEach((g) => {
    if (g.support === null) return;
    const own = (effects.groups ?? []).filter((d) => d.groupId === g.id).reduce((sum, d) => sum + d.delta, 0);
    g.support = clamp(g.support + scaled(effects.allGroups ?? 0) + scaled(own), 0, 100);
  });
}

function applyRisks(state: EngineState, risks: Partial<Record<RiskId, number>>): void {
  (Object.entries(risks) as [RiskId, number][]).forEach(([id, delta]) => {
    state.eventRisks[id] = (state.eventRisks[id] ?? 0) + delta;
  });
}

/** Aplica um `EventEffects` (efeito base ou opção de escolha, game-design §4.5). */
export function applyEventEffects(state: EngineState, effects: EventEffects): void {
  applyShocks(state, effects.indicators ?? {});
  applySupport(state, effects);
  (effects.sizes ?? []).forEach((s) => addSize(state, s.groupId, s.delta));
  state.moodMods.media += effects.media ?? 0;
  state.moodMods.military += effects.military ?? 0;
  applyRisks(state, effects.risks ?? {});
  state.capital = Math.max(0, state.capital + (effects.capital ?? 0));
  if (effects.crisis) state.lastCrisisTurn = state.turn;
}
