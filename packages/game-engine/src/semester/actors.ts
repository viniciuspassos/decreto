import { MOOD_THRESHOLDS } from "@decreto/game-content";
import type { ActorMood } from "@decreto/shared-types";
import { effectTotal, groupOf, isActive, over, type StepCtx } from "./common.js";

/** Nós com regra própria de humor da mídia (§3.6). */
const CAPTIVE_MEDIA_NODE = "censorship";
const LOYAL_MEDIA_NODE = "state-information-monopoly";

export function moodOf(score: number): ActorMood {
  if (score >= MOOD_THRESHOLDS.loyal) return "loyal";
  if (score >= MOOD_THRESHOLDS.neutral) return "neutral";
  return score >= MOOD_THRESHOLDS.critical ? "critical" : "hostile";
}

export function militaryScore(ctx: StepCtx): number {
  const { state } = ctx;
  const security = groupOf(state, "security-forces")?.support ?? 0;
  const debtPenalty = state.indicators.debt >= 120 ? 8 : 0;
  return security + effectTotal(ctx, "military") + state.moodMods.military - debtPenalty - 5 * state.recessionLevel;
}

export function mediaScore(ctx: StepCtx): number {
  const { state } = ctx;
  return 50 + 0.5 * (state.approval - 50) - 0.5 * over(state.indicators.corruption, 35)
    + effectTotal(ctx, "media") + state.moodMods.media;
}

function mediaMood(ctx: StepCtx): ActorMood {
  if (isActive(ctx.state, LOYAL_MEDIA_NODE)) return "loyal";
  const mood = moodOf(mediaScore(ctx));
  const captive = isActive(ctx.state, CAPTIVE_MEDIA_NODE) && (mood === "critical" || mood === "hostile");
  return captive ? "neutral" : mood;
}

/** §3.6: humores da mídia e das Forças Armadas a partir dos escores. */
export function updateMoods(ctx: StepCtx): void {
  ctx.state.actors = { media: mediaMood(ctx), military: moodOf(militaryScore(ctx)) };
}
