import { createTestDb } from "./testDb.js";
import { seedEventImages } from "./seed.js";
import { findImageForEvent } from "./eventImages.js";
import { eventImages } from "./schema.js";
import type { Db } from "./client.js";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  await seedEventImages(db);
});

afterAll(async () => {
  await close();
});

describe("findImageForEvent", () => {
  it("retorna a localização do arquivo quando o evento tem imagem", async () => {
    const fileLocation = await findImageForEvent(db, "prisao-oposicao");

    expect(fileLocation).toBe("prisao-oposicao/prisao-oposicao.png");
  });

  it("retorna null quando o evento não tem imagem cadastrada", async () => {
    const fileLocation = await findImageForEvent(db, "evento-inexistente");

    expect(fileLocation).toBeNull();
  });

  it("escolhe uma entre várias imagens cadastradas para o mesmo evento", async () => {
    const variantes = ["comicio/palanque.png", "comicio/multidao.png"];
    await db
      .insert(eventImages)
      .values(variantes.map((fileLocation) => ({ eventName: "comicio", fileLocation })));

    const fileLocation = await findImageForEvent(db, "comicio");

    expect(variantes).toContain(fileLocation);
  });
});
