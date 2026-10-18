import {
  GROUP_INDICATOR_REACTIONS, MEDIA_SUPPORT_EFFECT, type GroupIndicatorReaction,
} from "@decreto/game-content";
import type { GroupState, Indicators, Level } from "@decreto/shared-types";
import { addSize, activeEffects, clamp, effectTotal, type StepCtx } from "./common.js";

/** Média do apoio ponderada pelo tamanho; grupos emergentes (`support: null`) não contam. */
export function approvalOf(groups: GroupState[]): number {
  const counted = groups.filter((g) => g.support !== null && g.size > 0);
  const total = counted.reduce((sum, g) => sum + g.size, 0);
  return total === 0 ? 0 : counted.reduce((sum, g) => sum + (g.support ?? 0) * g.size, 0) / total;
}

/** Lealdade exibida, derivada do apoio corrente. */
export function loyaltyOf(support: number | null): Level {
  if (support === null || support < 40) return "low";
  return support >= 60 ? "high" : "medium";
}

/** §3.5: âncora para onde o apoio volta, com desgaste de −2 por mandato seguido. */
export function supportAnchor(ctx: StepCtx): number {
  return clamp(45 - 2 * (ctx.state.termsInRow - 1) + effectTotal(ctx, "supportAnchor"), 30, 65);
}

function reactionTerm(r: GroupIndicatorReaction, ind: Indicators): number {
  const value = ind[r.indicatorId];
  const limit = r.limit ?? Infinity;
  const excess = r.direction === "above" ? value - r.threshold : r.threshold - value;
  const raw = r.direction === "signed"
    ? r.coefficient * clamp(value - r.threshold, -limit, limit)
    : -r.coefficient * Math.max(0, excess);
  return r.hiddenByCensorship ? raw * clamp(ind.pressFreedom / 60, 0, 1) : raw;
}

/** Soma das linhas da tabela de reação aos indicadores (§3.5) que valem para o grupo. */
export function indicatorReaction(groupId: string, ind: Indicators): number {
  return GROUP_INDICATOR_REACTIONS
    .filter((r) => r.groups === "all" || r.groups.includes(groupId))
    .reduce((sum, r) => sum + reactionTerm(r, ind), 0);
}

/** Tamanhos por semestre: `tam` dos nós ativos (com teto) e `poor` puxado pelo desemprego (§3.5). */
export function updateSizes(ctx: StepCtx): void {
  const { state } = ctx;
  activeEffects(ctx).flatMap((e) => e.groupSizePerSemester ?? []).forEach(({ groupId, delta, cap }) => {
    const size = state.groups.find((g) => g.id === groupId)?.size ?? 0;
    if (cap === undefined || size < cap) addSize(state, groupId, cap === undefined ? delta : Math.min(delta, cap - size));
  });
  addSize(state, "poor", 0.1 * (state.indicators.unemployment - 8));
}

/** §3.5: reação aos indicadores + volta à âncora + humor da mídia − recessão; recalcula a aprovação. */
export function updateSupport(ctx: StepCtx): void {
  const { state } = ctx;
  const anchor = supportAnchor(ctx);
  const media = MEDIA_SUPPORT_EFFECT[state.actors.media];
  state.groups.forEach((g) => {
    if (g.support === null) return;
    const delta = indicatorReaction(g.id, state.indicators) + 0.08 * (anchor - g.support) + media - state.recessionLevel;
    g.support = clamp(g.support + delta, 0, 100);
  });
  state.approval = approvalOf(state.groups);
}
