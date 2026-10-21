import { randomBytes } from "node:crypto";
import { MAX_ACTIONS } from "@decreto/game-content";
import {
  campaignOptions, checkEnd, defaultContent, endGameResult, endSemester, isCampaignDue, isElectionDue, newGame, nodeCost, nodeStatus,
  projectVotes, queueTotalCost, runElection, validateQueue,
} from "@decreto/game-engine";
import type {
  CreateGameRequest, ElectionResponse, EndSemesterResponse, GameNodeView, GameView, QueuePreview,
} from "@decreto/shared-types";
import type { Db } from "../db/client.js";
import { createGame, getGame, saveGame, type StoredGame } from "../db/games.js";

export class GameNotFoundError extends Error {}
export class GameEndedError extends Error {}
export class InvalidGamePhaseError extends Error {}
export class InvalidPromiseError extends Error {}

function publicState(state: StoredGame["state"]): Omit<GameView, "id" | "version" | "phase" | "end" | "maxActions" | "nodes"> {
  return {
    country: state.country, president: state.president, turn: state.turn, term: state.term, approval: state.approval,
    capital: state.capital, capitalPerTurn: state.capitalPerTurn, activeNodes: state.activeNodes, indicators: state.indicators,
    groups: state.groups, actors: state.actors, promises: state.promises, campaignPromises: state.campaignPromises, history: state.history,
  };
}

function nodeViews(state: StoredGame["state"]): Record<string, GameNodeView> {
  return defaultContent.policyTrees.filter((tree) => !tree.intensity).flatMap((tree) => tree.nodes).reduce<Record<string, GameNodeView>>((nodes, nodeId) => {
    const status = nodeStatus(nodeId, { state, content: defaultContent });
    const cost = status === "queued" ? queuedNodeCost(state, nodeId)
      : status === "available" ? nodeCost(nodeId, { state, content: defaultContent }) : null;
    nodes[nodeId] = { status, cost };
    return nodes;
  }, {});
}

function queuedNodeCost(state: StoredGame["state"], nodeId: string): number {
  const index = state.queue.indexOf(nodeId);
  const before = { ...state, queue: state.queue.slice(0, index) };
  const through = { ...state, queue: state.queue.slice(0, index + 1) };
  return queueTotalCost({ state: through, content: defaultContent })
    - queueTotalCost({ state: before, content: defaultContent });
}

function phaseOf(game: StoredGame): GameView["phase"] {
  if (game.status === "ended") return "ended";
  if (isCampaignDue(game.state) && game.state.campaignPromises === undefined) return "campaign";
  if (isElectionDue(game.state)) return "election";
  return "playing";
}

export function gameView(game: StoredGame): GameView {
  return { ...publicState(game.state), id: game.id, version: game.version, phase: phaseOf(game), end: game.result, maxActions: MAX_ACTIONS, nodes: nodeViews(game.state) };
}

async function requiredGame(db: Db, gameId: string): Promise<StoredGame> {
  const game = await getGame(db, gameId);
  if (!game) throw new GameNotFoundError(`game ${gameId} was not found`);
  return game;
}

function requirePlaying(game: StoredGame): void {
  if (game.status === "ended") throw new GameEndedError(`game ${game.id} has ended`);
}

function requirePhase(game: StoredGame, expectedPhase: GameView["phase"]): void {
  requirePlaying(game);
  if (phaseOf(game) !== expectedPhase) throw new InvalidGamePhaseError(`game ${game.id} is not in ${expectedPhase} phase`);
}

function requireValidPromises(game: StoredGame, promises: string[]): void {
  const options = campaignOptions(game.state, defaultContent).map((option) => option.nodeId);
  if (promises.length > 3 || promises.some((promise) => !options.includes(promise))) {
    throw new InvalidPromiseError("promises must be up to three available campaign options");
  }
}

function requireBallotPromises(game: StoredGame, promises: string[]): void {
  const campaign = game.state.campaignPromises;
  if (campaign === undefined) return requireValidPromises(game, promises);
  if (promises.length !== campaign.length || promises.some((id, index) => id !== campaign[index])) {
    throw new InvalidPromiseError("promises must match the final-turn campaign selection");
  }
}

function queueState(game: StoredGame, queue: string[]): StoredGame["state"] {
  return { ...game.state, queue };
}

export async function createNewGame(db: Db, request: CreateGameRequest): Promise<GameView> {
  const seed = request.seed ?? randomBytes(4).readUInt32BE();
  const state = newGame({ ...request, seed }, defaultContent);
  return gameView(await createGame(db, state));
}

export async function findGame(db: Db, gameId: string): Promise<GameView> {
  return gameView(await requiredGame(db, gameId));
}

export async function previewQueue(db: Db, gameId: string, queue: string[]): Promise<QueuePreview> {
  const game = await requiredGame(db, gameId);
  requirePhase(game, "playing");
  const state = queueState(game, queue);
  const ctx = { state, content: defaultContent };
  return { nodes: nodeViews(state), totalCost: queueTotalCost(ctx), remaining: state.capital - queueTotalCost(ctx), errors: validateQueue(ctx) };
}

export async function closeSemester(db: Db, gameId: string, queue: string[], expectedVersion: number): Promise<EndSemesterResponse> {
  const game = await requiredGame(db, gameId);
  requirePhase(game, "playing");
  const { state, report } = endSemester(queueState(game, queue), defaultContent);
  const reason = checkEnd(state);
  const saved = await saveGame(db, { ...game, state, status: reason ? "ended" : "playing", result: reason ? endGameResult(state, reason, defaultContent) : null }, expectedVersion);
  return { game: gameView(saved), report, events: report.events, end: saved.result };
}

export async function electionPreview(db: Db, gameId: string, promises: string[]) {
  const game = await requiredGame(db, gameId);
  if (phaseOf(game) !== "campaign" && phaseOf(game) !== "election") throw new InvalidGamePhaseError(`game ${game.id} is not in campaign or election phase`);
  requireBallotPromises(game, promises);
  return { votes: projectVotes(game.state, promises, defaultContent), honeymoon: projectVotes(game.state, promises, defaultContent) >= 60 };
}

async function persistElectionOutcome(db: Db, game: StoredGame, promises: string[], expectedVersion: number): Promise<ElectionResponse> {
  const { state, won } = runElection({ ...game.state, campaignPromises: promises }, promises, defaultContent);
  const reason = checkEnd(state);
  const saved = await saveGame(db, { ...game, state, status: reason ? "ended" : "playing", result: reason ? endGameResult(state, reason, defaultContent) : null }, expectedVersion);
  return { game: gameView(saved), won, promises: [...promises], end: saved.result };
}

export async function vote(db: Db, gameId: string, promises: string[], expectedVersion: number): Promise<ElectionResponse> {
  const game = await requiredGame(db, gameId);
  requirePhase(game, "election");
  requireBallotPromises(game, promises);
  return persistElectionOutcome(db, game, promises, expectedVersion);
}

export async function campaign(db: Db, gameId: string) {
  const game = await requiredGame(db, gameId);
  if (phaseOf(game) !== "campaign" && phaseOf(game) !== "election") throw new InvalidGamePhaseError(`game ${game.id} is not in campaign or election phase`);
  return { options: campaignOptions(game.state, defaultContent), maxPromises: 3 };
}

export async function submitCampaign(db: Db, gameId: string, promises: string[], expectedVersion: number): Promise<ElectionResponse> {
  const game = await requiredGame(db, gameId);
  requirePhase(game, "campaign");
  requireValidPromises(game, promises);
  return persistElectionOutcome(db, game, promises, expectedVersion);
}
