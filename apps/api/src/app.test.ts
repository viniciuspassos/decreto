import request from "supertest";
import { createApp } from "./app.js";
import { createTestDb } from "./db/testDb.js";

describe("GET /health", () => {
  it("responde com status ok", async () => {
    const { db, close } = await createTestDb({ runMigrations: false });
    const app = createApp({ db, assetsDir: "/tmp" });

    try {
      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok", version: "0.1.0" });
    } finally {
      await close();
    }
  });
});
