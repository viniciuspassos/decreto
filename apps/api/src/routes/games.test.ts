import request from "supertest";
import { defaultContent, newGame } from "@decreto/game-engine";
import { createApp } from "../app.js";
import type { Db } from "../db/client.js";
import { createGame as persistGame, saveGame } from "../db/games.js";
import { createTestDb } from "../db/testDb.js";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});

afterAll(async () => {
  await close();
});

const app = () => createApp({ db, assetsDir: "/tmp" });

async function createGame() {
  const response = await request(app()).post("/games").send({ country: "Vessária", president: "Helena", situation: "stable" });
  return response.body as { id: string; version: number; nodes: Record<string, { status: string }> };
}

function availableNode(nodes: Record<string, { status: string }>): string {
  const nodeId = Object.entries(nodes).find(([, node]) => node.status === "available")?.[0];
  if (!nodeId) throw new Error("expected an available node");
  return nodeId;
}

describe("games routes", () => {
  it("creates a game without exposing the seed or queue", async () => {
    const response = await request(app()).post("/games").send({ country: "Vessária", president: "Helena", situation: "stable" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ country: "Vessária", version: 1, phase: "playing" });
    expect(response.body).not.toHaveProperty("seed");
    expect(response.body).not.toHaveProperty("queue");
  });

  it("accepts a deterministic seed outside production without exposing it", async () => {
    const response = await request(app()).post("/games").send({ country: "Vessária", president: "Helena", situation: "stable", seed: 7 });

    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty("seed");
  });

  it("rejects a client seed in production", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const response = await request(app()).post("/games").send({ country: "Vessária", president: "Helena", situation: "stable", seed: 7 });
      expect(response).toMatchObject({ status: 400, body: { code: "validation_error" } });
    } finally {
      process.env.NODE_ENV = previous;
    }
  });

  it("rejects an invalid body", async () => {
    const response = await request(app()).post("/games").send({ country: "", president: "Helena", situation: "wrong" });

    expect(response).toMatchObject({ status: 400, body: { code: "validation_error" } });
  });

  it("returns 404 for a missing game", async () => {
    const response = await request(app()).get("/games/00000000-0000-0000-0000-000000000000");

    expect(response).toMatchObject({ status: 404, body: { code: "game_not_found" } });
  });

  it("returns the persisted result when an ended game is resumed", async () => {
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const created = await persistGame(db, state);
    const result = { outcome: "defeat" as const, reason: "coup" as const, ranking: [], topTrees: [] };
    await saveGame(db, { ...created, status: "ended", result }, created.version);

    const response = await request(app()).get(`/games/${created.id}`);

    expect(response).toMatchObject({ status: 200, body: { phase: "ended", end: result } });
  });

  it("previews and closes a semester, rejecting an outdated version", async () => {
    const game = await createGame();
    const queue = [availableNode(game.nodes)];
    const preview = await request(app()).post(`/games/${game.id}/preview`).send({ queue });
    const closed = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue, expectedVersion: game.version });
    const outdated = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue: [], expectedVersion: game.version });

    expect(preview).toMatchObject({ status: 200, body: { errors: [] } });
    expect(preview.body.nodes[queue[0]!]).toMatchObject({ status: "queued", cost: preview.body.totalCost });
    expect(closed).toMatchObject({ status: 200, body: { game: { version: 2 }, report: { applied: queue } } });
    expect(outdated).toMatchObject({ status: 409, body: { code: "version_conflict" } });
  });

  it("rejects an invalid queue without changing the game", async () => {
    const game = await createGame();
    const response = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue: ["inexistente"], expectedVersion: game.version });

    expect(response).toMatchObject({ status: 400, body: { code: "invalid_queue" } });
  });

  it("rejects a semester close during an election", async () => {
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const game = await persistGame(db, { ...state, turn: 9 });
    const response = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue: [], expectedVersion: game.version });

    expect(response).toMatchObject({ status: 400, body: { code: "validation_error" } });
  });

  it("exposes campaigning, vote projection, and voting at the end of a term", async () => {
    const base = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const game = await persistGame(db, { ...base, turn: 9, campaignPromises: ["public-network-expansion"] });
    const campaign = await request(app()).get(`/games/${game.id}/campaign`);
    const promises = ["public-network-expansion"];
    const preview = await request(app()).post(`/games/${game.id}/election/preview`).send({ promises });
    const election = await request(app()).post(`/games/${game.id}/election`).send({ promises, expectedVersion: game.version });

    expect(campaign).toMatchObject({ status: 200, body: { maxPromises: 3 } });
    expect(preview).toMatchObject({ status: 200, body: { votes: expect.any(Number), honeymoon: expect.any(Boolean) } });
    expect(election).toMatchObject({ status: 200, body: { game: { version: game.version + 1 }, won: expect.any(Boolean), promises } });
  });

  it("collects promises after playing the final semester and immediately returns the election result", async () => {
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    state.turn = 8;
    state.groups.forEach((group) => { if (group.support !== null) group.support = 80; });
    state.approval = 80;
    const game = await persistGame(db, state);
    const beforeFinalSemester = await request(app()).get(`/games/${game.id}`);
    const earlyCampaign = await request(app()).get(`/games/${game.id}/campaign`);
    const closed = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue: [], expectedVersion: game.version });
    const campaign = await request(app()).get(`/games/${game.id}/campaign`);
    const selected = campaign.body.options[0].nodeId as string;
    const invalid = await request(app()).post(`/games/${game.id}/campaign`).send({ promises: ["inexistente"], expectedVersion: game.version + 1 });
    const result = await request(app()).post(`/games/${game.id}/campaign`).send({ promises: [selected], expectedVersion: game.version + 1 });

    expect(beforeFinalSemester).toMatchObject({ status: 200, body: { phase: "playing" } });
    expect(earlyCampaign).toMatchObject({ status: 400, body: { code: "validation_error" } });
    expect(closed).toMatchObject({ status: 200, body: { game: { turn: 9, phase: "campaign" } } });
    expect(campaign).toMatchObject({ status: 200, body: { options: expect.any(Array) } });
    expect(invalid).toMatchObject({ status: 400, body: { code: "validation_error" } });
    expect(result).toMatchObject({ status: 200, body: { game: { phase: "playing", term: 2 }, won: true, promises: [selected] } });
  });

  it("starts a normal semester after the AI term when the player loses", async () => {
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    state.turn = 9;
    state.groups.forEach((group) => { if (group.support !== null) group.support = 0; });
    state.approval = 0;
    const game = await persistGame(db, state);
    const campaign = await request(app()).post(`/games/${game.id}/campaign`).send({ promises: [], expectedVersion: game.version });

    expect(campaign).toMatchObject({ status: 200, body: { won: false, game: { phase: "playing", turn: 17, term: 3 } } });
  });

  it("rejects too many promises and elections in the wrong phase", async () => {
    const playing = await createGame();
    const preview = await request(app()).post(`/games/${playing.id}/election/preview`).send({ promises: [] });
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const election = await persistGame(db, { ...state, turn: 9 });
    const tooMany = await request(app()).post(`/games/${election.id}/election/preview`).send({ promises: ["a", "b", "c", "d"] });

    expect(preview).toMatchObject({ status: 400, body: { code: "validation_error" } });
    expect(tooMany).toMatchObject({ status: 400, body: { code: "validation_error" } });
  });

  it("rejects an unavailable promise when voting", async () => {
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const election = await persistGame(db, { ...state, turn: 9 });
    const response = await request(app()).post(`/games/${election.id}/election`).send({ promises: ["inexistente"], expectedVersion: election.version });

    expect(response).toMatchObject({ status: 400, body: { code: "validation_error" } });
  });
});
