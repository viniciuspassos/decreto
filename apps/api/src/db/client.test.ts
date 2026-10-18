import { createDb } from "./client.js";

describe("createDb", () => {
  it("lança erro quando DATABASE_URL não está definida e nenhuma connection string é passada", () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      expect(() => createDb()).toThrow("DATABASE_URL não está definida.");
    } finally {
      if (original !== undefined) {
        process.env.DATABASE_URL = original;
      }
    }
  });

  it("cria um client drizzle quando uma connection string é passada", async () => {
    const db = createDb("postgresql://decreto:decreto@localhost:5432/decreto");

    try {
      expect(db).toBeDefined();
    } finally {
      await db.$client.end();
    }
  });
});
