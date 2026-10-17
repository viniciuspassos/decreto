import request from "supertest";
import { createApp } from "./app.js";

describe("GET /health", () => {
  it("responde com status ok", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", version: "0.1.0" });
  });
});
