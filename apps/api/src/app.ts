import express, { type Express } from "express";
import type { HealthStatus } from "@decreto/shared-types";
import type { Db } from "./db/client.js";
import { createEventsRouter } from "./routes/events.js";

export interface CreateAppOptions {
  db: Db;
  assetsDir: string;
}

export function createApp({ db, assetsDir }: CreateAppOptions): Express {
  const app = express();

  app.get("/health", (_req, res) => {
    const body: HealthStatus = { status: "ok", version: "0.1.0" };
    res.json(body);
  });

  app.use(createEventsRouter(db, assetsDir));

  return app;
}
