import { createTestDb } from "./testDb.js";
import { eventImages } from "./schema.js";

describe("createTestDb", () => {
  it("aplica as migrations e devolve um banco funcional", async () => {
    const { db, close } = await createTestDb();

    try {
      const rows = await db.select().from(eventImages);
      expect(rows).toEqual([]);
    } finally {
      await close();
    }
  });

  it("com runMigrations: false, a tabela ainda não existe", async () => {
    const { db, close } = await createTestDb({ runMigrations: false });

    try {
      await expect(db.select().from(eventImages)).rejects.toThrow();
    } finally {
      await close();
    }
  });

  it("close() impede consultas seguintes", async () => {
    const { db, close } = await createTestDb();
    await close();

    await expect(db.select().from(eventImages)).rejects.toThrow();
  });

  it("fecha o client e repropaga o erro quando a migration falha", async () => {
    await expect(
      createTestDb({ migrationsFolder: "/caminho/de/migrations/inexistente" }),
    ).rejects.toThrow();
  });
});
