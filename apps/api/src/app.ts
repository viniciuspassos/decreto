import express, { type Express } from "express";
import type { HealthStatus } from "@decreto/shared-types";
import type { Db } from "./db/client.js";
import { createEventsRouter } from "./routes/events.js";
import { createGamesRouter } from "./routes/games.js";
import { GameEndedError, GameNotFoundError, InvalidGamePhaseError, InvalidPromiseError } from "./services/gameService.js";
import { InvalidQueueError } from "@decreto/game-engine";
import { VersionConflictError } from "./db/games.js";
import { ZodError } from "zod";

export interface CreateAppOptions {
  db: Db;
  assetsDir: string;
}

export function createApp({ db, assetsDir }: CreateAppOptions): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const body: HealthStatus = { status: "ok", version: "0.1.0" };
    res.json(body);
  });

  app.use(createEventsRouter(db, assetsDir));
  app.use(createGamesRouter(db));
  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    void next;
    if (error instanceof ZodError) return res.status(400).json({ code: "validation_error" });
    if (error instanceof InvalidQueueError) return res.status(400).json({ code: "invalid_queue" });
    if (error instanceof GameNotFoundError) return res.status(404).json({ code: "game_not_found" });
    if (error instanceof VersionConflictError) return res.status(409).json({ code: "version_conflict" });
    if (error instanceof GameEndedError) return res.status(409).json({ code: "game_ended" });
    if (error instanceof InvalidGamePhaseError || error instanceof InvalidPromiseError) return res.status(400).json({ code: "validation_error" });
    return res.status(500).json({ code: "internal_error" });
  });

  return app;
}
