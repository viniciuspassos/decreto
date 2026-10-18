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
});
