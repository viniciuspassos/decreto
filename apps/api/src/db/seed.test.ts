import path from "node:path";
import { fileURLToPath } from "node:url";
import { jest } from "@jest/globals";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { eq } from "drizzle-orm";
import { createDb, type Db } from "./client.js";
import { main, handleCliError } from "./seed.js";
import { eventImages } from "./schema.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const seededEventName = "prisao-oposicao";
let db: Db;

beforeAll(async () => {
  db = createDb();
  await migrate(db, { migrationsFolder: path.resolve(dirname, "../../drizzle") });
});

afterAll(async () => {
  await db.$client.end();
});

// Cada teste reparte o fixture seedado por nome de evento, nunca a tabela inteira
// — outros arquivos de teste rodam contra o mesmo Postgres e têm suas próprias linhas.
async function clearSeededFixture(): Promise<void> {
  await db.delete(eventImages).where(eq(eventImages.eventName, seededEventName));
}

describe("main", () => {
  it("insere o seed inicial quando a linha não existe", async () => {
    await clearSeededFixture();

    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toEqual([expect.objectContaining({ fileLocation: "prisao-oposicao/prisao-oposicao.png" })]);
  });

  it("não duplica a linha quando ela já existe com o mesmo fileLocation", async () => {
    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toHaveLength(1);
  });

  it("atualiza o fileLocation em vez de duplicar quando ele mudou", async () => {
    await clearSeededFixture();
    await db
      .insert(eventImages)
      .values({ eventName: seededEventName, fileLocation: "prisao-oposicao/caminho-antigo.png" });

    await expect(main(db)).resolves.toBeUndefined();

    const rows = await db.select().from(eventImages).where(eq(eventImages.eventName, seededEventName));
    expect(rows).toEqual([expect.objectContaining({ fileLocation: "prisao-oposicao/prisao-oposicao.png" })]);
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
