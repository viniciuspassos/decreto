import { and, eq, sql } from "drizzle-orm";
import type { EndGameResult } from "@decreto/shared-types";
import type { EngineState } from "@decreto/game-engine";
import type { Db } from "./client.js";
import { games, type GameStatus, type PersistedGameState } from "./schema.js";

export interface StoredGame {
  id: string;
  state: EngineState;
  version: number;
  status: GameStatus;
  result: EndGameResult | null;
}

export class VersionConflictError extends Error {
  constructor(gameId: string, expectedVersion: number) {
    super(`game ${gameId} does not have expected version ${expectedVersion}`);
  }
}

function persistState(state: EngineState): PersistedGameState {
  const persistedState = structuredClone(state);
  Reflect.deleteProperty(persistedState, "queue");
  return persistedState;
}

function restoreState(state: PersistedGameState): EngineState {
  return { ...state, queue: [] };
}

function mapStoredGame(row: typeof games.$inferSelect): StoredGame {
  return { id: row.id, state: restoreState(row.state), version: row.version, status: row.status, result: row.result };
}

export async function createGame(db: Db, state: EngineState): Promise<StoredGame> {
  const [row] = await db.insert(games).values({ state: persistState(state) }).returning();
  if (!row) throw new Error("game insert did not return a row");
  return mapStoredGame(row);
}

export async function getGame(db: Db, gameId: string): Promise<StoredGame | null> {
  const [row] = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  return row ? mapStoredGame(row) : null;
}

export async function saveGame(db: Db, game: StoredGame, expectedVersion: number): Promise<StoredGame> {
  const [row] = await db
    .update(games)
    .set({
      state: persistState(game.state),
      status: game.status,
      result: game.result,
      version: sql`${games.version} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(games.id, game.id), eq(games.version, expectedVersion)))
    .returning();
  if (!row) throw new VersionConflictError(game.id, expectedVersion);
  return mapStoredGame(row);
}
