import { jest } from "@jest/globals";
import { eq } from "drizzle-orm";
import { createTestDb } from "./testDb.js";
import { main, handleCliError } from "./seed.js";
import { eventImages } from "./schema.js";
import type { Db } from "./client.js";

const seededEventName = "prisao-oposicao";
let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
});

afterAll(async () => {
  await close();
});

// Each test scopes the seeded fixture by event name, never the entire table
// — the other tests in this file use the same in-memory database.
async function clearSeededFixture(): Promise<void> {
  await db.delete(eventImages).where(eq(eventImages.eventName, seededEventName));
}

describe("main", () => {
  it("inserts the initial seed when the row does not exist", async () => {
    await clearSeededFixture();

    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toEqual([expect.objectContaining({ fileLocation: "prisao-oposicao/prisao-oposicao.png" })]);
  });

  it("does not duplicate the row when it already has the same fileLocation", async () => {
    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toHaveLength(1);
  });

  it("updates fileLocation instead of duplicating when it has changed", async () => {
    await clearSeededFixture();
    await db
      .insert(eventImages)
      .values({ eventName: seededEventName, fileLocation: "prisao-oposicao/old-path.png" });

    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toEqual([expect.objectContaining({ fileLocation: "prisao-oposicao/prisao-oposicao.png" })]);
  });
});

describe("handleCliError", () => {
  it("logs the error and marks the process as failed", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const originalExitCode = process.exitCode;

    handleCliError(new Error("test failure"));

    expect(consoleErrorSpy).toHaveBeenCalledWith("[db] failed to apply seed", expect.any(Error));
    expect(process.exitCode).toBe(1);

    process.exitCode = originalExitCode;
    consoleErrorSpy.mockRestore();
  });
});
