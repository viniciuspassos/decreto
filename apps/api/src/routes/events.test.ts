import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createApp } from "../app.js";
import { createDb, type Db } from "../db/client.js";
import { seedEventImages } from "../db/seed.js";
import { eventImages } from "../db/schema.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(dirname, "../../../../assets/images");
let db: Db;

beforeAll(async () => {
  db = createDb();
  await migrate(db, { migrationsFolder: path.resolve(dirname, "../../drizzle") });
  await seedEventImages(db);
});

afterAll(async () => {
  await db.$client.end();
});

describe("GET /events/:eventName/image", () => {
  it("retorna a imagem do evento quando ela existe", async () => {
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/prisao-oposicao/image");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("image/png");
  });

  it("retorna 404 quando o evento não tem imagem cadastrada", async () => {
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/evento-inexistente/image");

    expect(response.status).toBe(404);
  });

  it("retorna 404 em vez de escapar de ASSETS_DIR (path traversal)", async () => {
    await db
      .insert(eventImages)
      .values({ eventName: "traversal-test", fileLocation: "../../../../etc/passwd" });
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/traversal-test/image");

    expect(response.status).toBe(404);
  });

  it("retorna 404 quando o arquivo cadastrado não existe em disco", async () => {
    await db
      .insert(eventImages)
      .values({ eventName: "arquivo-ausente", fileLocation: "eventos/nao-existe.png" });
    const app = createApp({ db, assetsDir });

    const response = await request(app).get("/events/arquivo-ausente/image");

    expect(response.status).toBe(404);
  });

  it("retorna 500 (em vez de derrubar o processo) quando a consulta ao banco falha", async () => {
    const brokenDb = createDb();
    await brokenDb.$client.end();
    const app = createApp({ db: brokenDb, assetsDir });

    const response = await request(app).get("/events/prisao-oposicao/image");

    expect(response.status).toBe(500);
  });
});
