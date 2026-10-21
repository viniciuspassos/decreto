import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { createApp } from "../app.js";
import { createTestDb } from "../db/testDb.js";
import { seedEventImages } from "../db/seed.js";
import { eventImages } from "../db/schema.js";
import type { Db } from "../db/client.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(dirname, "../../../../assets/images");
let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  await seedEventImages(db);
});

afterAll(async () => {
  await close();
});

describe("GET /events/:eventName/image", () => {
  it("returns the event image when it exists", async () => {
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/prisao-oposicao/image");

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
