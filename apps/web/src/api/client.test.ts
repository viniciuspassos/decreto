import { ApiError, gameApi } from "./client.js";
import { gameFixture } from "../test/gameFixture.js";

class FakeGameServer {
  readonly requests: { url: string; method: string; body: unknown }[] = [];
  status = 200;
  body: unknown = gameFixture();
  fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    this.requests.push({ url: String(input), method: init?.method ?? "GET", body: init?.body ? JSON.parse(String(init.body)) : null });
    return { ok: this.status >= 200 && this.status < 300, status: this.status,
      json: async () => this.body } as Response;
  };
}

describe("gameApi", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it("sends typed create, preview, semester and election requests through /api", async () => {
    const server = new FakeGameServer();
    global.fetch = server.fetch;
    await gameApi.create({ country: "Vessária", president: "Helena", situation: "stable" });
    await gameApi.preview("game/1", ["privatizations"]);
    await gameApi.endSemester(gameFixture(), ["privatizations"]);
    await gameApi.saveCampaign(gameFixture(), ["privatizations"]);
    await gameApi.vote(gameFixture(), ["privatizations"]);
    expect(server.requests).toEqual([
      { url: "/api/games", method: "POST", body: { country: "Vessária", president: "Helena", situation: "stable" } },
      { url: "/api/games/game%2F1/preview", method: "POST", body: { queue: ["privatizations"] } },
      { url: "/api/games/game-1/end-semester", method: "POST", body: { queue: ["privatizations"], expectedVersion: 1 } },
      { url: "/api/games/game-1/campaign", method: "POST", body: { promises: ["privatizations"], expectedVersion: 1 } },
      { url: "/api/games/game-1/election", method: "POST", body: { promises: ["privatizations"], expectedVersion: 1 } },
    ]);
  });

  it("reports API code and status", async () => {
    const server = new FakeGameServer();
    server.status = 409;
    server.body = { code: "version_conflict" };
    global.fetch = server.fetch;
    await expect(gameApi.get("game-1")).rejects.toMatchObject({ code: "version_conflict", status: 409 });
  });

  it("reports network failures", async () => {
    global.fetch = async () => { throw new TypeError("offline"); };
    await expect(gameApi.get("game-1")).rejects.toEqual(new ApiError("network_error", 0));
  });
});
