/**
 * Types shared between apps/web and apps/api.
 * Ver CLAUDE.md -> "Estrutura de monorepo".
 */

export type Locale = "pt-BR" | "en";

export interface HealthStatus {
  status: "ok";
  version: string;
}

/*
 * Game state contract between the engine (apps/api) and UI (apps/web).
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
  /** % of the population (groups overlap). */
  size: number;
  /** % support for the government; `null` for groups that have not emerged or support no one. */
  support: number | null;
  delta: number;
  loyalty: Level;
  /** Last policy the group remembers (node ID). */
  memory: string | null;
}

export interface TermRecord {
  term: number;
  inPower: boolean;
}

export interface GameState {
  country: string;
  president: string;
  /** Global turn, starting at 1 (2 per year, 80 in 40 years). */
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
  /** Semester events (drawn and system), with headlines via `event.<id>.*` (game-design §4.6). */
  events: CountryEvent[];
}

export interface CountryEvent {
  id: string;
  turn: number;
  option?: "a" | "b";
  /** Event choice not yet resolved by the player (§4.4). */
  pending: boolean;
  /** Shows the image from `assets/events/<id>` (at most 1 drawn event per semester, §4.1). */
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

export type GamePhase = "playing" | "election" | "ended";

export interface GameNodeView {
  status: NodeStatus;
  cost: number | null;
}

/** State exposed by the API; the queue belongs to the client and the seed stays on the server. */
export interface GameView extends Omit<GameState, "queue"> {
  id: string;
  version: number;
  phase: GamePhase;
  /** Persisted outcome, available when resuming an ended game. */
  end: EndGameResult | null;
  maxActions: number;
  nodes: Record<string, GameNodeView>;
}

export interface QueuePreview {
  nodes: Record<string, GameNodeView>;
  totalCost: number;
  remaining: number;
  errors: { code: string; nodeId?: string }[];
}

export interface CreateGameRequest {
  country: string;
  president: string;
  situation: InitialSituation;
  /** Deterministic test runs only; rejected by the API in production. */
  seed?: number;
}

export interface PreviewQueueRequest {
  queue: string[];
}

export interface EndSemesterRequest extends PreviewQueueRequest {
  expectedVersion: number;
}

export interface ElectionPreviewRequest {
  promises: string[];
}

export interface ElectionRequest extends ElectionPreviewRequest {
  expectedVersion: number;
}

export interface EndSemesterResponse {
  game: GameView;
  report: SemesterReport;
  events: CountryEvent[];
  end: EndGameResult | null;
}

export interface CampaignResponse {
  options: CampaignPromise[];
  maxPromises: number;
}

export interface ElectionPreviewResponse {
  votes: number;
  honeymoon: boolean;
}

export interface ElectionResponse {
  game: GameView;
  won: boolean;
  end: EndGameResult | null;
}
