import type { ActorMood, IndicatorId } from "@decreto/shared-types";

/**
 * Movement-layer tables (game-design §1.1, §3). This module contains numbers only; their formulas
 * live in `packages/game-engine/src/semester/`.
 */

/** The 9 level indicators (everything except `debt`, which is a stock). */
export type LevelIndicatorId = Exclude<IndicatorId, "debt">;

export const LEVEL_INDICATORS: LevelIndicatorId[] = [
  "gdp", "unemployment", "inflation", "crime", "health", "education", "pollution", "pressFreedom", "corruption",
];

/** §1.1: display range (clamp) for each indicator. */
export const INDICATOR_RANGES: Record<IndicatorId, [min: number, max: number]> = {
  gdp: [-15, 15], unemployment: [1, 45], inflation: [-5, 300], debt: [0, 400], crime: [0, 100],
  health: [0, 100], education: [0, 100], pollution: [0, 100], pressFreedom: [0, 100], corruption: [0, 100],
};

export interface IndicatorDynamics {
  /** κ: fraction of the distance to the target recovered per semester. */
  reversion: number;
  /** μ: fraction of the previous semester's change that repeats. */
  momentum: number;
  /** σ: noise deviation before scaling by instability. */
  noise: number;
}

/** §3.1 */
export const INDICATOR_DYNAMICS: Record<LevelIndicatorId, IndicatorDynamics> = {
  gdp: { reversion: 0.25, momentum: 0.3, noise: 0.35 },
  unemployment: { reversion: 0.2, momentum: 0.3, noise: 0.25 },
  inflation: { reversion: 0.2, momentum: 0.3, noise: 0.4 },
  crime: { reversion: 0.15, momentum: 0.2, noise: 1.0 },
  health: { reversion: 0.15, momentum: 0.2, noise: 0.6 },
  education: { reversion: 0.1, momentum: 0.2, noise: 0.4 },
  pollution: { reversion: 0.1, momentum: 0.2, noise: 0.6 },
  pressFreedom: { reversion: 0.15, momentum: 0.2, noise: 0.5 },
  corruption: { reversion: 0.1, momentum: 0.2, noise: 0.8 },
};

/**
 * One row in the per-semester group response table for indicators (§3.5):
 * - `above`: `−coefficient × max(0, value − threshold)`;
 * - `below`: `−coefficient × max(0, threshold − value)`;
 * - `signed`: `+coefficient × clamp(value − threshold, −limit, +limit)`.
 * `hiddenByCensorship` multiplies by `clamp(pressFreedom / 60, 0, 1)`: with no free press, groups do not learn about it.
 */
export interface GroupIndicatorReaction {
  groups: string[] | "all";
  indicatorId: IndicatorId;
  direction: "above" | "below" | "signed";
  threshold: number;
  coefficient: number;
  limit?: number;
  hiddenByCensorship?: boolean;
}

export const GROUP_INDICATOR_REACTIONS: GroupIndicatorReaction[] = [
  { groups: "all", indicatorId: "gdp", direction: "signed", threshold: 1.5, coefficient: 0.6, limit: 4 },
  { groups: ["workers"], indicatorId: "unemployment", direction: "above", threshold: 9, coefficient: 0.5 },
  { groups: ["youth"], indicatorId: "unemployment", direction: "above", threshold: 9, coefficient: 0.4 },
  { groups: ["poor"], indicatorId: "inflation", direction: "above", threshold: 8, coefficient: 0.3 },
  { groups: ["poor", "retirees"], indicatorId: "health", direction: "below", threshold: 45, coefficient: 0.2 },
  { groups: ["retirees"], indicatorId: "inflation", direction: "above", threshold: 6, coefficient: 0.4 },
  { groups: ["middle-class"], indicatorId: "inflation", direction: "above", threshold: 6, coefficient: 0.3 },
  { groups: ["middle-class"], indicatorId: "crime", direction: "above", threshold: 45, coefficient: 0.25 },
  { groups: ["business", "rich"], indicatorId: "inflation", direction: "above", threshold: 10, coefficient: 0.3 },
  { groups: ["environmentalists"], indicatorId: "pollution", direction: "above", threshold: 55, coefficient: 0.3 },
  { groups: ["progressives"], indicatorId: "pollution", direction: "above", threshold: 55, coefficient: 0.1 },
  { groups: ["progressives"], indicatorId: "pressFreedom", direction: "below", threshold: 50, coefficient: 0.1 },
  {
    groups: ["progressives", "youth", "middle-class"], indicatorId: "corruption", direction: "above",
    threshold: 45, coefficient: 0.15, hiddenByCensorship: true,
  },
];

/** Population-share range for groups with custom limits (§3.5, §3.8); all others range from 0 to 100. */
export const GROUP_SIZE_LIMITS: Record<string, [min: number, max: number]> = {
  poor: [5, 60], revolutionaries: [0, 20], rebels: [0, 15],
};

/** §3.6: minimum score for each mood (below `critical` means hostile). */
export const MOOD_THRESHOLDS = { loyal: 55, neutral: 40, critical: 25 } as const;

/** §3.5: support added to all groups each semester based on media mood. */
export const MEDIA_SUPPORT_EFFECT: Record<ActorMood, number> = { loyal: 1, neutral: 0, critical: -1, hostile: -2 };

/** §3.6: multiplier for negative event effects on support. */
export const MEDIA_NEGATIVE_EVENT_MULTIPLIER: Record<ActorMood, number> = {
  loyal: 0.6, neutral: 1.0, critical: 1.2, hostile: 1.4,
};

/** §3.7: revolution-risk multiplier and coup-risk baseline by military mood. */
export const REVOLUTION_MOOD_MULTIPLIER: Record<ActorMood, number> = { loyal: 0.5, neutral: 1.0, critical: 1.3, hostile: 1.6 };
export const COUP_MOOD_BASE: Record<ActorMood, number> = { loyal: 0, neutral: 0, critical: 4, hostile: 12 };

export interface RecessionLevel {
  level: 1 | 2 | 3;
  enterDebt: number;
  exitDebt: number;
  /** A "pre-recession GDP" value below this also triggers entry; if absent, only debt applies. */
  enterGdp?: number;
}

/** §3.4, with hysteresis: enter at the entry threshold and exit only below the exit threshold. */
export const RECESSION_LEVELS: RecessionLevel[] = [
  { level: 1, enterDebt: 100, exitDebt: 90, enterGdp: -2 },
  { level: 2, enterDebt: 130, exitDebt: 120, enterGdp: -5 },
  { level: 3, enterDebt: 170, exitDebt: 160 },
];

/** §4.1: number of events selected per semester (never zero). */
export const EVENT_COUNT_ODDS: { count: number; probability: number }[] = [
  { count: 1, probability: 0.35 },
  { count: 2, probability: 0.45 },
  { count: 3, probability: 0.2 },
];
