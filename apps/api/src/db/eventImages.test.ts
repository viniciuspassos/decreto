import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb, type Db } from "./client.js";
import { seedEventImages } from "./seed.js";
import { findImageForEvent } from "./eventImages.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
let db: Db;

beforeAll(async () => {
  db = createDb();
  await migrate(db, { migrationsFolder: path.resolve(dirname, "../../drizzle") });
  await seedEventImages(db);
});

afterAll(async () => {
  await db.$client.end();
});

describe("findImageForEvent", () => {
  it("retorna a localização do arquivo quando o evento tem imagem", async () => {
    const fileLocation = await findImageForEvent(db, "prisao-oposicao");

    expect(fileLocation).toBe("eventos/prisao-oposicao.png");
  });

  it("retorna null quando o evento não tem imagem cadastrada", async () => {
    const fileLocation = await findImageForEvent(db, "evento-inexistente");

    expect(fileLocation).toBeNull();
  });
});
