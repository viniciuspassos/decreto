import { jest } from "@jest/globals";

class FakePool {
  static instances: FakePool[] = [];
  readonly connectionString: string;
  ended = false;

  constructor(options: { connectionString: string }) {
    this.connectionString = options.connectionString;
    FakePool.instances.push(this);
  }

  async end(): Promise<void> {
    this.ended = true;
  }
}

const fakeMigrate = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
const fakeDrizzle = jest.fn<(pool: FakePool) => FakePool>((pool) => pool);

jest.unstable_mockModule("pg", () => ({ Pool: FakePool }));
jest.unstable_mockModule("drizzle-orm/node-postgres", () => ({ drizzle: fakeDrizzle }));
jest.unstable_mockModule("drizzle-orm/node-postgres/migrator", () => ({ migrate: fakeMigrate }));

const { main } = await import("./migrate.js");

afterEach(() => {
  delete process.env.DATABASE_URL;
  FakePool.instances.length = 0;
  fakeMigrate.mockReset().mockResolvedValue(undefined);
  fakeDrizzle.mockClear();
});

it("rejects a missing connection string", async () => {
  delete process.env.DATABASE_URL;
  await expect(main()).rejects.toThrow("DATABASE_URL is required");
  expect(FakePool.instances).toHaveLength(0);
});

it("applies migrations and closes the database pool", async () => {
  process.env.DATABASE_URL = "postgresql://localhost/decreto";
  await main();

  expect(FakePool.instances[0]?.connectionString).toBe(process.env.DATABASE_URL);
  expect(fakeMigrate).toHaveBeenCalledWith(FakePool.instances[0], expect.any(Object));
  expect(FakePool.instances[0]?.ended).toBe(true);
});

it("closes the database pool when migration fails", async () => {
  process.env.DATABASE_URL = "postgresql://localhost/decreto";
  fakeMigrate.mockRejectedValueOnce(new Error("migration failed"));

  await expect(main()).rejects.toThrow("migration failed");
  expect(FakePool.instances[0]?.ended).toBe(true);
});
