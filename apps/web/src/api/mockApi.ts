/**
 * MOCK do backend para a v0 do frontend. As regras aqui são provisórias e grosseiras: o motor real
 * vive em apps/api + packages/game-engine (ver docs/ARCHITECTURE.md). Ao ligar o backend, trocar
 * este módulo por chamadas HTTP mantendo as assinaturas — os componentes só falam com ele.
 */
import {
  BASE_INDICATORS,
  COUP_APPROVAL,
  EXTRA_PREREQS,
  LAST_TURN,
  MAX_ACTIONS,
  SITUATIONS,
  TERMS_TO_WIN,
  TURNS_PER_TERM,
  nodeFigures,
  policyTrees,
  voterGroups,
} from "@decreto/game-content";
import type {
  ActorMood,
  CampaignPromise,
  EndGameResult,
  GameEvent,
  GameState,
  GroupState,
  IndicatorId,
  Indicators,
  InitialSituation,
  NodeStatus,
  RiskId,
  SemesterReport,
} from "@decreto/shared-types";

export { MAX_ACTIONS, TURNS_PER_TERM };

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

export const treeOf = (nodeId: string) => policyTrees.find((t) => t.nodes.includes(nodeId));
export const depthOf = (nodeId: string) => (treeOf(nodeId)?.nodes.indexOf(nodeId) ?? -1) + 1;
export const activeCount = (state: GameState, treeId: string) =>
  state.activeNodes.filter((n) => treeOf(n)?.id === treeId).length;

/** S3: 10 × (1 + profundidade + 0,4 × distância). Mock: distância = profundidade − 1 (máx. 3). */
export function nodeCost(nodeId: string): number {
  const depth = depthOf(nodeId);
  return Math.round(10 * (1 + depth + 0.4 * Math.min(3, depth - 1)));
}

export const queuedCost = (state: GameState) => state.queue.reduce((sum, n) => sum + nodeCost(n), 0);

export function nodeStatus(state: GameState, nodeId: string): NodeStatus {
  if (state.activeNodes.includes(nodeId)) return "active";
  if (state.queue.includes(nodeId)) return "queued";
  const tree = treeOf(nodeId);
  if (!tree) return "blocked";
  const prev = tree.nodes[tree.nodes.indexOf(nodeId) - 1];
  const prevOk = prev === undefined || state.activeNodes.includes(prev);
  const extra = EXTRA_PREREQS[nodeId];
  const extraOk = !extra || extra.some((n) => state.activeNodes.includes(n));
  const opposed = tree.opposite !== undefined && activeCount(state, tree.opposite) > 0;
  return prevOk && extraOk && !opposed ? "available" : "blocked";
}

export function toggleQueued(state: GameState, nodeId: string): GameState {
  if (state.queue.includes(nodeId)) return { ...state, queue: state.queue.filter((n) => n !== nodeId) };
  const affordable = queuedCost(state) + nodeCost(nodeId) <= state.capital;
  const ok = nodeStatus(state, nodeId) === "available" && state.queue.length < MAX_ACTIONS && affordable;
  return ok ? { ...state, queue: [...state.queue, nodeId] } : state;
}

export function newGame(country: string, president: string, situation: InitialSituation): GameState {
  const groups: GroupState[] = voterGroups.map((g) => ({
    id: g.id,
    size: g.initialSize,
    support: g.emergent ? null : 50,
    delta: 0,
    loyalty: "medium",
    memory: null,
  }));
  return {
    country, president, turn: 1, term: 1, approval: 50, capital: 60, capitalPerTurn: 25,
    activeNodes: [], queue: [], indicators: { ...BASE_INDICATORS, ...SITUATIONS[situation] }, groups,
    actors: { media: situation === "stable" ? "neutral" : "critical", military: "loyal" },
    promises: [], history: [],
  };
}

/** Save de exemplo exibido em "Continuar partida". */
export function loadSave(): GameState {
  const base = newGame("República de Vessária", "Helena Duarte", "unstable");
  const activeNodes = ["secret-police", "opposition-surveillance", "strategic-state-company", "public-network-expansion"];
  return { ...base, turn: 3, capital: 112, approval: 52, activeNodes };
}

function reactions(applied: string[]) {
  return voterGroups.map((g) => {
    const touched = applied.filter((n) => {
      const tree = treeOf(n)?.id ?? "";
      return g.likes.includes(tree) || g.dislikes.includes(tree);
    });
    const delta = touched.reduce((sum, n) => sum + (g.likes.includes(treeOf(n)?.id ?? "") ? 4 : -4), 0);
    return { id: g.id, delta, memory: touched.at(-1) };
  });
}

const wobble = (turn: number, i: number) => ((turn * 7 + i * 3) % 5) - 2;

function driftIndicators(ind: Indicators, turn: number): Indicators {
  const entries = (Object.keys(ind) as IndicatorId[]).map((id, i) => {
    const scale = id === "gdp" || id === "unemployment" || id === "inflation" ? 0.3 : 1;
    return [id, round1(ind[id] + wobble(turn, i) * scale)] as const;
  });
  return Object.fromEntries(entries) as Indicators;
}

function approvalOf(groups: GroupState[]): number {
  const counted = groups.filter((g) => g.support !== null && g.size > 0);
  const total = counted.reduce((s, g) => s + g.size, 0);
  return Math.round(counted.reduce((s, g) => s + (g.support ?? 0) * g.size, 0) / total);
}

const mediaMood = (pressFreedom: number): ActorMood =>
  pressFreedom > 60 ? "neutral" : pressFreedom > 40 ? "critical" : "hostile";

function risksOf(state: GameState): Record<RiskId, number> {
  const revolutionaries = state.groups.find((g) => g.id === "revolutionaries")?.size ?? 0;
  return {
    coup: clamp((50 - state.approval) * 2),
    attack: clamp(revolutionaries * 20),
    revolution: clamp(revolutionaries * 10),
    rebels: state.indicators.debt > 90 ? 40 : 0,
  };
}

function applyGroups(groups: GroupState[], applied: string[]): GroupState[] {
  const radical = applied.filter((n) => depthOf(n) >= 3).length;
  const byId = new Map(reactions(applied).map((r) => [r.id, r]));
  return groups.map((g) => {
    const r = byId.get(g.id);
    if (g.id === "revolutionaries") return { ...g, size: round1(g.size + radical * 0.4) };
    if (g.support === null || !r) return g;
    return { ...g, delta: r.delta, support: clamp(g.support + r.delta), memory: r.memory ?? g.memory };
  });
}

export function endSemester(state: GameState): { state: GameState; report: SemesterReport; event: GameEvent | null } {
  const applied = state.queue;
  const groups = applyGroups(state.groups, applied);
  const approval = approvalOf(groups);
  const indicators = driftIndicators(state.indicators, state.turn);
  const security = groups.find((g) => g.id === "security-forces")?.support ?? 50;
  const next: GameState = {
    ...state, turn: state.turn + 1, activeNodes: [...state.activeNodes, ...applied], queue: [], groups,
    approval, indicators, capital: state.capital - queuedCost(state) + state.capitalPerTurn,
    capitalPerTurn: Math.round(approval / 2),
    actors: { media: mediaMood(indicators.pressFreedom), military: security >= 45 ? "loyal" : "critical" },
  };
  const groupChanges = groups.filter((g) => g.delta !== 0).map((g) => ({ id: g.id, delta: g.delta }));
  const report: SemesterReport = {
    applied, approvalBefore: state.approval, capitalBefore: state.capital,
    indicatorsBefore: state.indicators, groupChanges, risks: risksOf(next), events: [],
  };
  const revealed = applied.find((n) => nodeFigures[n]);
  const event: GameEvent | null = revealed
    ? { nodeId: revealed, figureId: nodeFigures[revealed] ?? "", consequences: reactions([revealed]).filter((r) => r.delta).map((r) => ({ groupId: r.id, delta: r.delta })) }
    : null;
  return { state: next, report, event };
}

export const isElectionTurn = (state: GameState) => state.turn > 1 && (state.turn - 1) % TURNS_PER_TERM === 0;

export function campaignOptions(state: GameState): CampaignPromise[] {
  const fields = new Set<string>();
  return policyTrees
    .filter((t) => t.field !== "power" && !fields.has(t.field) && fields.add(t.field))
    .map((t) => t.nodes.find((n) => nodeStatus(state, n) === "available"))
    .filter((n): n is string => n !== undefined)
    .slice(0, 6)
    .map((nodeId) => {
      const tree = treeOf(nodeId)?.id ?? "";
      return {
        nodeId,
        gains: voterGroups.filter((g) => g.likes.includes(tree)).map((g) => g.id),
        loses: voterGroups.filter((g) => g.dislikes.includes(tree)).map((g) => g.id),
      };
    });
}

export const projectVotes = (state: GameState, promises: CampaignPromise[]) =>
  clamp(state.approval + promises.reduce((s, p) => s + 2 * p.gains.length - p.loses.length, 0));

export function runElection(state: GameState, promises: CampaignPromise[]): { state: GameState; won: boolean } {
  const won = projectVotes(state, promises) > 50;
  const history = [...state.history, { term: state.term, inPower: won }];
  const next: GameState = won
    ? { ...state, term: state.term + 1, promises: promises.map((p) => p.nodeId), history }
    : { ...state, turn: state.turn + TURNS_PER_TERM, approval: 50, promises: [], history };
  return { state: next, won };
}

const yearsInPowerWon = (state: GameState) => {
  const lastLoss = state.history.map((h) => h.inPower).lastIndexOf(false);
  return state.history.length - lastLoss - 1;
};

export function checkEnd(state: GameState): EndGameResult["reason"] | null {
  if (state.approval < COUP_APPROVAL) return "coup";
  if (yearsInPowerWon(state) >= TERMS_TO_WIN) return "twentyYears";
  if (state.turn > LAST_TURN) return "fortyYears";
  return null;
}

export function endGame(state: GameState, reason: EndGameResult["reason"]): EndGameResult {
  const counts = new Map<string, number>();
  state.activeNodes.forEach((n) => {
    const f = nodeFigures[n];
    if (f) counts.set(f, (counts.get(f) ?? 0) + 1);
  });
  const figures = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f);
  const ranking = (figures.length ? figures : ["nelson-mandela"]).slice(0, 5)
    .map((figureId, i) => ({ figureId, similarity: 78 - i * 11 }));
  const topTrees = policyTrees
    .map((t) => ({ id: t.id, n: activeCount(state, t.id) }))
    .filter((t) => t.n > 0).sort((a, b) => b.n - a.n).slice(0, 5).map((t) => t.id);
  return { outcome: reason === "twentyYears" ? "victory" : "defeat", reason, ranking, topTrees };
}
