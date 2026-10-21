import { Router } from "express";
import { z } from "zod";
import type { Db } from "../db/client.js";
import { campaign, closeSemester, createNewGame, electionPreview, findGame, previewQueue, vote } from "../services/gameService.js";

const createSchema = z.object({
  country: z.string().min(1), president: z.string().min(1), situation: z.enum(["stable", "unstable", "crisis"]),
  seed: z.number().int().min(0).max(0xffffffff).optional(),
}).refine((request) => request.seed === undefined || process.env.NODE_ENV !== "production", {
  message: "seed is accepted only outside production", path: ["seed"],
});
const queueSchema = z.object({ queue: z.array(z.string()) });
const versionedQueueSchema = queueSchema.extend({ expectedVersion: z.number().int().positive() });
const promisesSchema = z.object({ promises: z.array(z.string()).max(3) });
const versionedPromisesSchema = promisesSchema.extend({ expectedVersion: z.number().int().positive() });

function parse<T>(schema: z.ZodType<T>, body: unknown): T {
  return schema.parse(body);
}

export function createGamesRouter(db: Db): Router {
  const router = Router();

  router.post("/games", async (req, res, next) => {
    try { res.status(201).json(await createNewGame(db, parse(createSchema, req.body))); } catch (error) { next(error); }
  });
  router.get("/games/:id", async (req, res, next) => {
    try { res.json(await findGame(db, req.params.id)); } catch (error) { next(error); }
  });
  router.post("/games/:id/preview", async (req, res, next) => {
    try { res.json(await previewQueue(db, req.params.id, parse(queueSchema, req.body).queue)); } catch (error) { next(error); }
  });
  router.post("/games/:id/end-semester", async (req, res, next) => {
    try {
      const request = parse(versionedQueueSchema, req.body);
      res.json(await closeSemester(db, req.params.id, request.queue, request.expectedVersion));
    } catch (error) { next(error); }
  });
  router.get("/games/:id/campaign", async (req, res, next) => {
    try { res.json(await campaign(db, req.params.id)); } catch (error) { next(error); }
  });
  router.post("/games/:id/election/preview", async (req, res, next) => {
    try { res.json(await electionPreview(db, req.params.id, parse(promisesSchema, req.body).promises)); } catch (error) { next(error); }
  });
  router.post("/games/:id/election", async (req, res, next) => {
    try {
      const request = parse(versionedPromisesSchema, req.body);
      res.json(await vote(db, req.params.id, request.promises, request.expectedVersion));
    } catch (error) { next(error); }
  });
  return router;
}
