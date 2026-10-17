import express, { type Express } from "express";
import type { HealthStatus } from "@decreto/shared-types";

export function createApp(): Express {
  const app = express();

  app.get("/health", (_req, res) => {
    const body: HealthStatus = { status: "ok", version: "0.1.0" };
    res.json(body);
  });

  return app;
}
