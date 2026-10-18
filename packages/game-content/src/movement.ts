import type { ActorMood, IndicatorId } from "@decreto/shared-types";

/**
 * Tabelas da camada de movimento (game-design §1.1, §3). Só números: as fórmulas que os usam
 * vivem em `packages/game-engine/src/semester/`.
 */

/** Os 9 indicadores de nível (tudo menos `debt`, que é estoque). */
export type LevelIndicatorId = Exclude<IndicatorId, "debt">;

export const LEVEL_INDICATORS: LevelIndicatorId[] = [
  "gdp", "unemployment", "inflation", "crime", "health", "education", "pollution", "pressFreedom", "corruption",
];

/** §1.1: faixa (clamp) de cada indicador exibido. */
export const INDICATOR_RANGES: Record<IndicatorId, [min: number, max: number]> = {
  gdp: [-15, 15], unemployment: [1, 45], inflation: [-5, 300], debt: [0, 400], crime: [0, 100],
  health: [0, 100], education: [0, 100], pollution: [0, 100], pressFreedom: [0, 100], corruption: [0, 100],
};

export interface IndicatorDynamics {
  /** κ: fração da distância ao alvo recuperada por semestre. */
  reversion: number;
  /** μ: fração da variação do semestre anterior que se repete. */
  momentum: number;
  /** σ: desvio do ruído antes da escala de instabilidade. */
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
 * Uma linha da tabela de reação dos grupos aos indicadores (§3.5), por semestre:
 * - `above`: `−coeficiente × max(0, valor − limiar)`;
 * - `below`: `−coeficiente × max(0, limiar − valor)`;
 * - `signed`: `+coeficiente × clamp(valor − limiar, −limite, +limite)`.
 * `hiddenByCensorship` multiplica por `clamp(pressFreedom / 60, 0, 1)`: sem imprensa, ninguém fica sabendo.
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

/** Faixa de tamanho (% da população) de grupos com limite próprio (§3.5, §3.8); os demais vão de 0 a 100. */
export const GROUP_SIZE_LIMITS: Record<string, [min: number, max: number]> = {
  poor: [5, 60], revolutionaries: [0, 20], rebels: [0, 15],
};

/** §3.6: escore mínimo de cada humor (abaixo de `critical` = hostil). */
export const MOOD_THRESHOLDS = { loyal: 55, neutral: 40, critical: 25 } as const;

/** §3.5: apoio somado a todos os grupos por semestre conforme o humor da mídia. */
export const MEDIA_SUPPORT_EFFECT: Record<ActorMood, number> = { loyal: 1, neutral: 0, critical: -1, hostile: -2 };

/** §3.6: multiplicador dos efeitos negativos de eventos sobre apoio. */
export const MEDIA_NEGATIVE_EVENT_MULTIPLIER: Record<ActorMood, number> = {
  loyal: 0.6, neutral: 1.0, critical: 1.2, hostile: 1.4,
};

/** §3.7: multiplicador do risco de revolução e base do risco de golpe pelo humor militar. */
export const REVOLUTION_MOOD_MULTIPLIER: Record<ActorMood, number> = { loyal: 0.5, neutral: 1.0, critical: 1.3, hostile: 1.6 };
export const COUP_MOOD_BASE: Record<ActorMood, number> = { loyal: 0, neutral: 0, critical: 4, hostile: 12 };

export interface RecessionLevel {
  level: 1 | 2 | 3;
  enterDebt: number;
  exitDebt: number;
  /** "PIB pré-recessão" abaixo disto também faz entrar; ausente = só dívida. */
  enterGdp?: number;
}

/** §3.4, com histerese: entra pelo limiar de entrada, só sai abaixo do de saída. */
export const RECESSION_LEVELS: RecessionLevel[] = [
  { level: 1, enterDebt: 100, exitDebt: 90, enterGdp: -2 },
  { level: 2, enterDebt: 130, exitDebt: 120, enterGdp: -5 },
  { level: 3, enterDebt: 170, exitDebt: 160 },
];

/** §4.1: quantos eventos saem no semestre (nunca zero). */
export const EVENT_COUNT_ODDS: { count: number; probability: number }[] = [
  { count: 1, probability: 0.35 },
  { count: 2, probability: 0.45 },
  { count: 3, probability: 0.2 },
];
