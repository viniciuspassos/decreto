import { jest } from "@jest/globals";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { eq } from "drizzle-orm";
import { createTestDb } from "./testDb.js";
import { main, handleCliError, resolveAssetsDir } from "./seed.js";
import { eventImages } from "./schema.js";
import type { Db } from "./client.js";

const seededEventName = "prisao-oposicao";
let db: Db;
let close: () => Promise<void>;
let assetsDir: string;

beforeAll(async () => {
  ({ db, close } = await createTestDb());
  assetsDir = await mkdtemp(path.join(os.tmpdir(), "decreto-seed-assets-"));
  const eventDir = path.join(assetsDir, seededEventName);
  await mkdir(eventDir);
  await writeFile(path.join(eventDir, "prisao-oposicao.png"), "image");
  const aliasDir = path.join(assetsDir, "estado-minimo");
  await mkdir(aliasDir);
  await writeFile(path.join(aliasDir, "estado-minimo.png"), "image");
});

afterAll(async () => {
  await close();
  await rm(assetsDir, { recursive: true, force: true });
});

// Each test scopes the seeded fixture by event name, never the entire table
// — the other tests in this file use the same in-memory database.
async function clearSeededFixture(): Promise<void> {
  await db.delete(eventImages).where(eq(eventImages.eventName, seededEventName));
}

describe("main", () => {
  it("registers image files found in each event directory", async () => {
    await clearSeededFixture();

    await expect(main(db, assetsDir)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toEqual([expect.objectContaining({ fileLocation: "prisao-oposicao/prisao-oposicao.png" })]);
    const collapseImage = await db.select().from(eventImages).where(eq(eventImages.eventName, "infrastructure-collapse"));
    expect(collapseImage).toEqual([expect.objectContaining({ fileLocation: "estado-minimo/estado-minimo.png" })]);
  });

  it("does not duplicate the row when it already has the same fileLocation", async () => {
    await expect(main(db, assetsDir)).resolves.toBeUndefined();
    await expect(main(db, assetsDir)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toHaveLength(1);
  });

  it("registers newly uploaded images on a later seed", async () => {
    await writeFile(path.join(assetsDir, seededEventName, "second.png"), "image");

    await expect(main(db, assetsDir)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows.map((row) => row.fileLocation).sort()).toEqual([
      "prisao-oposicao/prisao-oposicao.png",
      "prisao-oposicao/second.png",
    ]);
  });
});

describe("resolveAssetsDir", () => {
  it("resolves a configured asset path relative to the API process directory", () => {
    const originalAssetsDir = process.env.ASSETS_DIR;
    process.env.ASSETS_DIR = "asset-fixtures/images";
    try {
      expect(resolveAssetsDir()).toBe(path.resolve(process.cwd(), "asset-fixtures/images"));
    } finally {
      if (originalAssetsDir === undefined) delete process.env.ASSETS_DIR;
      else process.env.ASSETS_DIR = originalAssetsDir;
    }
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
