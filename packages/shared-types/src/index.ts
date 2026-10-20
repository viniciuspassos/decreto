/**
 * Tipos compartilhados entre apps/web e apps/api.
 * Ver CLAUDE.md -> "Estrutura de monorepo".
 */

export type Locale = "pt-BR" | "en";

export interface HealthStatus {
  status: "ok";
  version: string;
}

/*
 * Contrato do estado de partida entre motor (apps/api) e UI (apps/web).
 * Na v0 do frontend, `apps/web/src/api/mockApi.ts` produz esses objetos.
 */

export type IndicatorId =
  | "gdp"
  | "unemployment"
  | "inflation"
  | "debt"
  | "crime"
  | "health"
  | "education"
  | "pollution"
  | "pressFreedom"
  | "corruption";

export type Indicators = Record<IndicatorId, number>;
export type ActorMood = "loyal" | "neutral" | "critical" | "hostile";
export type Level = "low" | "medium" | "high";
export type InitialSituation = "stable" | "unstable" | "crisis";
export type NodeStatus = "active" | "queued" | "available" | "blocked";
export type RiskId = "coup" | "attack" | "revolution" | "rebels";

export interface GroupState {
  id: string;
  /** % da população (grupos se sobrepõem). */
  size: number;
  /** % de apoio ao governo; `null` para grupos que ainda não surgiram ou não apoiam ninguém. */
  support: number | null;
  delta: number;
  loyalty: Level;
  /** Última política de que o grupo se lembra (id de nó). */
  memory: string | null;
}

export interface TermRecord {
  term: number;
  inPower: boolean;
}

export interface GameState {
  country: string;
  president: string;
  /** Turno global, começando em 1 (2 por ano, 80 em 40 anos). */
  turn: number;
  term: number;
  approval: number;
  capital: number;
  capitalPerTurn: number;
  activeNodes: string[];
  queue: string[];
  indicators: Indicators;
  groups: GroupState[];
  actors: { media: ActorMood; military: ActorMood };
  promises: string[];
  history: TermRecord[];
}

export interface SemesterReport {
  applied: string[];
  approvalBefore: number;
  capitalBefore: number;
  indicatorsBefore: Indicators;
  groupChanges: { id: string; delta: number }[];
  risks: Record<RiskId, number>;
  /** Eventos do semestre (sorteados e de sistema), com as manchetes via `event.<id>.*` (game-design §4.6). */
  events: CountryEvent[];
}

export interface CountryEvent {
  id: string;
  turn: number;
  option?: "a" | "b";
  /** Evento com escolha ainda não resolvida pelo jogador (§4.4). */
  pending: boolean;
  /** Mostra a imagem de `assets/events/<id>` (no máximo 1 evento sorteado por semestre, §4.1). */
  image?: boolean;
}

export interface GameEvent {
  nodeId: string;
  figureId: string;
  consequences: { groupId: string; delta: number }[];
}

export interface CampaignPromise {
  nodeId: string;
  gains: string[];
  loses: string[];
}

export interface EndGameResult {
  outcome: "victory" | "defeat";
  reason: "twentyYears" | "coup" | "attack" | "revolution" | "fortyYears";
  ranking: { figureId: string; similarity: number }[];
  topTrees: string[];
}
