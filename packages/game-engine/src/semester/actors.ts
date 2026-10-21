import { MOOD_THRESHOLDS } from "@decreto/game-content";
import type { ActorMood } from "@decreto/shared-types";
import { activeEffects, effectTotal, groupOf, over, type StepCtx } from "./common.js";

/** From worst to best mood, to apply the `mediaFloor`. */
const MOOD_ORDER: ActorMood[] = ["hostile", "critical", "neutral", "loyal"];

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

/** Mood from the score, never below the highest `mediaFloor` among active nodes (captive/loyal media). */
function mediaMood(ctx: StepCtx): ActorMood {
  const floors = activeEffects(ctx).flatMap((e) => e.mediaFloor ?? []);
  const rank = Math.max(...[moodOf(mediaScore(ctx)), ...floors].map((m) => MOOD_ORDER.indexOf(m)));
  return MOOD_ORDER[rank] ?? "neutral";
}

/** §3.6: media and Armed Forces moods derived from scores. */
export function updateMoods(ctx: StepCtx): void {
  ctx.state.actors = { media: mediaMood(ctx), military: moodOf(militaryScore(ctx)) };
}
