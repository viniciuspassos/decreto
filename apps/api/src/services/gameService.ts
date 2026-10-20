import { randomBytes } from "node:crypto";
import { MAX_ACTIONS } from "@decreto/game-content";
import {
  campaignOptions, checkEnd, defaultContent, endGameResult, endSemester, isElectionDue, newGame, nodeCost, nodeStatus,
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

function publicState(state: StoredGame["state"]): Omit<GameView, "id" | "version" | "phase" | "maxActions" | "nodes"> {
  return {
    country: state.country, president: state.president, turn: state.turn, term: state.term, approval: state.approval,
    capital: state.capital, capitalPerTurn: state.capitalPerTurn, activeNodes: state.activeNodes, indicators: state.indicators,
    groups: state.groups, actors: state.actors, promises: state.promises, history: state.history,
  };
}

function nodeViews(state: StoredGame["state"]): Record<string, GameNodeView> {
  return defaultContent.policyTrees.filter((tree) => !tree.intensity).flatMap((tree) => tree.nodes).reduce<Record<string, GameNodeView>>((nodes, nodeId) => {
    const status = nodeStatus(nodeId, { state, content: defaultContent });
    nodes[nodeId] = { status, cost: status === "available" ? nodeCost(nodeId, { state, content: defaultContent }) : null };
    return nodes;
  }, {});
}

function phaseOf(game: StoredGame): GameView["phase"] {
  if (game.status === "ended") return "ended";
  return isElectionDue(game.state) ? "election" : "playing";
}

export function gameView(game: StoredGame): GameView {
  return { ...publicState(game.state), id: game.id, version: game.version, phase: phaseOf(game), maxActions: MAX_ACTIONS, nodes: nodeViews(game.state) };
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

function queueState(game: StoredGame, queue: string[]): StoredGame["state"] {
  return { ...game.state, queue };
}

export async function createNewGame(db: Db, request: CreateGameRequest): Promise<GameView> {
  const seed = randomBytes(4).readUInt32BE();
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
  requirePhase(game, "election");
  requireValidPromises(game, promises);
  return { votes: projectVotes(game.state, promises, defaultContent), honeymoon: projectVotes(game.state, promises, defaultContent) >= 60 };
}

export async function vote(db: Db, gameId: string, promises: string[], expectedVersion: number): Promise<ElectionResponse> {
  const game = await requiredGame(db, gameId);
  requirePhase(game, "election");
  requireValidPromises(game, promises);
  const { state, won } = runElection(game.state, promises, defaultContent);
  const reason = checkEnd(state);
  const saved = await saveGame(db, { ...game, state, status: reason ? "ended" : "playing", result: reason ? endGameResult(state, reason, defaultContent) : null }, expectedVersion);
  return { game: gameView(saved), won, end: saved.result };
}

export async function campaign(db: Db, gameId: string) {
  const game = await requiredGame(db, gameId);
  requirePhase(game, "election");
  return { options: campaignOptions(game.state, defaultContent), maxPromises: 3 };
}
