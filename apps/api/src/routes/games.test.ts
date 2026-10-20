import request from "supertest";
import { defaultContent, newGame } from "@decreto/game-engine";
import { createApp } from "../app.js";
import type { Db } from "../db/client.js";
import { createGame as persistGame } from "../db/games.js";
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
  it("cria uma partida e não expõe seed ou fila", async () => {
    const response = await request(app()).post("/games").send({ country: "Vessária", president: "Helena", situation: "stable" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ country: "Vessária", version: 1, phase: "playing" });
    expect(response.body).not.toHaveProperty("seed");
    expect(response.body).not.toHaveProperty("queue");
  });

  it("rejeita corpo inválido", async () => {
    const response = await request(app()).post("/games").send({ country: "", president: "Helena", situation: "wrong" });

    expect(response).toMatchObject({ status: 400, body: { code: "validation_error" } });
  });

  it("retorna 404 para partida ausente", async () => {
    const response = await request(app()).get("/games/00000000-0000-0000-0000-000000000000");

    expect(response).toMatchObject({ status: 404, body: { code: "game_not_found" } });
  });

  it("pré-visualiza e encerra semestre, rejeitando versão antiga", async () => {
    const game = await createGame();
    const queue = [availableNode(game.nodes)];
    const preview = await request(app()).post(`/games/${game.id}/preview`).send({ queue });
    const closed = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue, expectedVersion: game.version });
    const outdated = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue: [], expectedVersion: game.version });

    expect(preview).toMatchObject({ status: 200, body: { errors: [] } });
    expect(closed).toMatchObject({ status: 200, body: { game: { version: 2 }, report: { applied: queue } } });
    expect(outdated).toMatchObject({ status: 409, body: { code: "version_conflict" } });
  });

  it("rejeita fila inválida sem alterar a partida", async () => {
    const game = await createGame();
    const response = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue: ["inexistente"], expectedVersion: game.version });

    expect(response).toMatchObject({ status: 400, body: { code: "invalid_queue" } });
  });

  it("rejeita semestre durante eleição", async () => {
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const game = await persistGame(db, { ...state, turn: 9 });
    const response = await request(app()).post(`/games/${game.id}/end-semester`).send({ queue: [], expectedVersion: game.version });

    expect(response).toMatchObject({ status: 400, body: { code: "validation_error" } });
  });

  it("expõe campanha, projeção e votação ao fim do mandato", async () => {
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const game = await persistGame(db, { ...state, turn: 9 });
    const campaign = await request(app()).get(`/games/${game.id}/campaign`);
    const preview = await request(app()).post(`/games/${game.id}/election/preview`).send({ promises: [] });
    const election = await request(app()).post(`/games/${game.id}/election`).send({ promises: [], expectedVersion: game.version });

    expect(campaign).toMatchObject({ status: 200, body: { maxPromises: 3 } });
    expect(preview).toMatchObject({ status: 200, body: { votes: expect.any(Number), honeymoon: expect.any(Boolean) } });
    expect(election).toMatchObject({ status: 200, body: { game: { version: game.version + 1 }, won: expect.any(Boolean) } });
  });

  it("rejeita promessa demais e eleição fora de fase", async () => {
    const playing = await createGame();
    const preview = await request(app()).post(`/games/${playing.id}/election/preview`).send({ promises: [] });
    const state = newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);
    const election = await persistGame(db, { ...state, turn: 9 });
    const tooMany = await request(app()).post(`/games/${election.id}/election/preview`).send({ promises: ["a", "b", "c", "d"] });

    expect(preview).toMatchObject({ status: 400, body: { code: "validation_error" } });
    expect(tooMany).toMatchObject({ status: 400, body: { code: "validation_error" } });
  });
});
