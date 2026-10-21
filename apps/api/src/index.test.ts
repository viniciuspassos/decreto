import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { startServer } from "./index.js";
import { createTestDb } from "./db/testDb.js";

describe("startServer", () => {
  let server: Server;
  let close: () => Promise<void>;

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await close();
  });

  it("starts the HTTP server and responds at /health", async () => {
    process.env.PORT = "0";
    const { db, close: closeDb } = await createTestDb();
    close = closeDb;
    server = startServer(db);
    await new Promise<void>((resolve) => server.once("listening", resolve));

    const { port } = server.address() as AddressInfo;
    const response = await fetch(`http://localhost:${port}/health`);

    expect(response.status).toBe(200);
    delete process.env.PORT;
  });
});
