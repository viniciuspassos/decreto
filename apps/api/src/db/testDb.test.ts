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

  it("with runMigrations: false, the table does not exist yet", async () => {
    const { db, close } = await createTestDb({ runMigrations: false });

    try {
      await expect(db.select().from(eventImages)).rejects.toThrow();
    } finally {
      await close();
    }
  });

  it("close() prevents subsequent queries", async () => {
    const { db, close } = await createTestDb();
    await close();

    await expect(db.select().from(eventImages)).rejects.toThrow();
  });

  it("closes the client and rethrows the error when migration fails", async () => {
    await expect(
      createTestDb({ migrationsFolder: "/path/to/migrations/missing" }),
    ).rejects.toThrow();
  });
});
