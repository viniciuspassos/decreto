import path from "node:path";
import { Router } from "express";
import type { Db } from "../db/client.js";
import { findImageForEvent } from "../db/eventImages.js";

export function createEventsRouter(db: Db, assetsDir: string): Router {
  const router = Router();

  router.get("/events/:eventName/image", (req, res) => {
    void (async () => {
      const fileLocation = await findImageForEvent(db, req.params.eventName);
      if (!fileLocation) {
        res.sendStatus(404);
        return;
      }

      const resolvedAssetsDir = path.resolve(assetsDir);
      const absolutePath = path.resolve(resolvedAssetsDir, fileLocation);
      const isInsideAssetsDir = absolutePath.startsWith(resolvedAssetsDir + path.sep);
      if (!isInsideAssetsDir) {
        res.sendStatus(404);
        return;
      }

      res.sendFile(absolutePath, (error: Error | undefined) => {
        if (error && !res.headersSent) {
          res.sendStatus(404);
        }
      });
    })();
  });

  return router;
}
