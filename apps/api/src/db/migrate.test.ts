import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import { runMigrations } from "./migrate.js";

it("applies the committed migrations and remains safe to rerun", async () => {
  const client = await PGlite.create();
  try {
    const db = drizzle(client);
    await runMigrations(db, migrate);
    await runMigrations(db, migrate);

    const result = await client.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' and table_name = 'games'",
    );
    expect(result.rows).toEqual([{ table_name: "games" }]);
  } finally {
    await client.close();
  }
});
