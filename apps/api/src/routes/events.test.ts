import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../app.js";
import { createTestDb } from "../db/testDb.js";
import { seedEventImages } from "../db/seed.js";
import { eventImages } from "../db/schema.js";
import type { Db } from "../db/client.js";

let assetsDir: string;
let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  assetsDir = await mkdtemp(path.join(os.tmpdir(), "decreto-event-images-"));
  const imagePath = path.join(assetsDir, "prisao-oposicao", "prisao-oposicao.png");
  await mkdir(path.dirname(imagePath), { recursive: true });
  await writeFile(
    imagePath,
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pWQAAAAASUVORK5CYII=",
      "base64",
    ),
  );
  const aliasImageDir = path.join(assetsDir, "estado-minimo");
  await mkdir(aliasImageDir);
  await writeFile(
    path.join(aliasImageDir, "estado-minimo.png"),
    Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pWQAAAAASUVORK5CYII=", "base64"),
  );
  ({ db, close } = await createTestDb());
  await seedEventImages(db, assetsDir);
});

afterAll(async () => {
  await close();
  await rm(assetsDir, { recursive: true, force: true });
});

describe("GET /events/:eventName/image", () => {
  it("returns the event image when it exists", async () => {
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/prisao-oposicao/image");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/png");
  });

  it("returns mapped artwork for a milestone without a dedicated event image", async () => {
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/infrastructure-collapse/image");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/png");
  });

  it("returns 404 when the event has no registered image", async () => {
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/evento-inexistente/image");

    expect(response.status).toBe(404);
  });

  it("returns 404 instead of escaping ASSETS_DIR (path traversal)", async () => {
    await db
      .insert(eventImages)
      .values({ eventName: "traversal-test", fileLocation: "../../../../etc/passwd" });
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/traversal-test/image");

    expect(response.status).toBe(404);
  });

  it("returns 404 when the registered file does not exist on disk", async () => {
    await db
      .insert(eventImages)
      .values({ eventName: "missing-file", fileLocation: "events/missing.png" });
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/missing-file/image");

    expect(response.status).toBe(404);
  });

  it("returns 500 (instead of crashing the process) when the database query fails", async () => {
    const { db: brokenDb, close: closeBrokenDb } = await createTestDb({ runMigrations: false });
    await closeBrokenDb();
    const app = createApp({ db: brokenDb, assetsDir });

    const response = await request(app).get("/events/prisao-oposicao/image");

    expect(response.status).toBe(500);
  });
});
