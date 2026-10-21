import { jest } from "@jest/globals";

jest.unstable_mockModule("./cli.js", () => ({
  run: jest.fn(async () => 1),
}));

describe("bin (run resolve)", () => {
  it("sets process.exitCode from the value resolved by run()", async () => {
    await import("./bin.js");
    await new Promise((resolve) => setImmediate(resolve));

    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });
});
