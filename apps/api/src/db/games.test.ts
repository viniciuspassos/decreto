import { defaultContent, newGame } from "@decreto/game-engine";
import { eq } from "drizzle-orm";
import type { Db } from "./client.js";
import { createGame, getGame, saveGame, VersionConflictError } from "./games.js";
import { games } from "./schema.js";
import { createTestDb } from "./testDb.js";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});

afterAll(async () => {
  await close();
});

const state = () => newGame({ country: "Vessária", president: "Helena", situation: "stable", seed: 5 }, defaultContent);

describe("games repository", () => {
  it("creates and reads a game without persisting its UI queue", async () => {
    const created = await createGame(db, { ...state(), queue: ["harsher-sentences"] });
    const found = await getGame(db, created.id);

    expect(found).toMatchObject({ id: created.id, version: 1, status: "playing" });
    expect(found?.state.queue).toEqual([]);
    expect(found?.state.country).toBe("Vessária");
    const [stored] = await db.select().from(games).where(eq(games.id, created.id));
    expect(stored?.state).not.toHaveProperty("queue");
  });

  it("saves with optimistic concurrency and increments the version", async () => {
    const created = await createGame(db, state());
    const saved = await saveGame(db, { ...created, state: { ...created.state, capital: 82 } }, created.version);

    expect(saved.version).toBe(2);
    expect((await getGame(db, created.id))?.state.capital).toBe(82);
  });

  it("rejects a save with an old version", async () => {
    const created = await createGame(db, state());
    await saveGame(db, created, created.version);

    await expect(saveGame(db, created, created.version)).rejects.toBeInstanceOf(VersionConflictError);
  });
});
