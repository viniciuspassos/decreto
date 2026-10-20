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

export type GamePhase = "playing" | "election" | "ended";

export interface GameNodeView {
  status: NodeStatus;
  cost: number | null;
}

/** Estado exposto pela API; a fila pertence ao cliente e a seed fica apenas no servidor. */
export interface GameView extends Omit<GameState, "queue"> {
  version: number;
  phase: GamePhase;
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
