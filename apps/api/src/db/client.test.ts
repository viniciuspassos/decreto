import { createDb } from "./client.js";

describe("createDb", () => {
  it("throws when DATABASE_URL is not defined and no connection string is provided", () => {
    const original = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;

    try {
      expect(() => createDb()).toThrow("DATABASE_URL is not defined.");
    } finally {
      if (original !== undefined) {
        process.env.DATABASE_URL = original;
      }
    }
  });

  it("creates a drizzle client when a connection string is provided", async () => {
    const db = createDb("postgresql://decreto:decreto@localhost:5432/decreto");

    try {
      expect(db).toBeDefined();
    } finally {
      await db.$client.end();
    }
  });
});
