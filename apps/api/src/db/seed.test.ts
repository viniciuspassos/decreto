import path from "node:path";
import { fileURLToPath } from "node:url";
import { jest } from "@jest/globals";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDb, type Db } from "./client.js";
import { main, handleCliError } from "./seed.js";
import { eventImages } from "./schema.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
let db: Db;

beforeAll(async () => {
  db = createDb();
  await migrate(db, { migrationsFolder: path.resolve(dirname, "../../drizzle") });
});

afterAll(async () => {
  await db.$client.end();
});

describe("main", () => {
  it("insere o seed inicial quando a tabela está vazia", async () => {
    await db.delete(eventImages);

    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages);
    expect(rows).toHaveLength(1);
  });

  it("não duplica o seed quando a linha já existe", async () => {
    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages);
    expect(rows).toHaveLength(1);
  });
});

describe("handleCliError", () => {
  it("registra o erro e marca o processo como falho", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const originalExitCode = process.exitCode;

    handleCliError(new Error("falha de teste"));

    expect(consoleErrorSpy).toHaveBeenCalledWith("[db] falha ao aplicar seed", expect.any(Error));
    expect(process.exitCode).toBe(1);

    process.exitCode = originalExitCode;
    consoleErrorSpy.mockRestore();
  });
});
