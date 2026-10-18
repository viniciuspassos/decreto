import { jest } from "@jest/globals";

jest.unstable_mockModule("./cli.js", () => ({
  run: jest.fn(async () => 1),
}));

describe("bin (run resolve)", () => {
  it("define process.exitCode a partir do valor resolvido por run()", async () => {
    await import("./bin.js");
    await new Promise((resolve) => setImmediate(resolve));

    expect(process.exitCode).toBe(1);
    process.exitCode = 0;
  });
});
