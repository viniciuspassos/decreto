import type { EventEffects } from "@decreto/game-content";
import type { SemesterContent } from "../content.js";
import type { EngineState } from "../state.js";
import { cloneState, displayedIndicators, type StepCtx } from "./common.js";
import { applyEventEffects } from "./effects.js";
import { approvalOf } from "./groups.js";
import { updateMoods } from "./actors.js";

export type ChoiceOption = "a" | "b";

/** Recalcula o que deriva da base e do apoio depois de aplicar efeitos fora da ordem do semestre. */
export function refresh(ctx: StepCtx): void {
  ctx.state.indicators = displayedIndicators(ctx);
  ctx.state.approval = approvalOf(ctx.state.groups);
  updateMoods(ctx);
}

function optionEffects(eventId: string, option: ChoiceOption, content: SemesterContent): EventEffects | undefined {
  return content.events.find((e) => e.id === eventId)?.options?.[option].effects;
}

/** Opção que custa mais capital do que o jogador tem fica desabilitada (§4.4). */
export function canAfford(state: EngineState, effects: EventEffects): boolean {
  return state.capital + (effects.capital ?? 0) >= 0;
}

function applyChoice(ctx: StepCtx, eventId: string, effects: EventEffects): void {
  ctx.state.pendingChoices = ctx.state.pendingChoices.filter((p) => p.eventId !== eventId);
  applyEventEffects(ctx.state, effects);
  refresh(ctx);
}

/**
 * Resolve uma escolha pendente no início do turno (§4.4): não gasta ação, só o capital da opção.
 * Os riscos da opção valem para a rolagem do semestre corrente.
 */
export function resolveEventChoice(
  state: EngineState, eventId: string, option: ChoiceOption, content: SemesterContent,
): EngineState {
  const effects = optionEffects(eventId, option, content);
  if (!effects || !state.pendingChoices.some((p) => p.eventId === eventId)) {
    throw new Error(`no pending choice "${eventId}"`);
  }
  if (!canAfford(state, effects)) throw new Error(`insufficient capital for "${eventId}" option ${option}`);
  const next = cloneState(state);
  applyChoice({ state: next, content }, eventId, effects);
  return next;
}

/** Escolhas que o jogador deixou em aberto: vale a opção A, ou a B se a A estiver sem capital. */
export function resolveDefaultChoices(ctx: StepCtx): void {
  ctx.state.pendingChoices.forEach(({ eventId }) => {
    const a = optionEffects(eventId, "a", ctx.content);
    const effects = a && canAfford(ctx.state, a) ? a : optionEffects(eventId, "b", ctx.content);
    if (effects) applyChoice(ctx, eventId, effects);
  });
  ctx.state.pendingChoices = [];
}
