import { jest } from "@jest/globals";

jest.unstable_mockModule("./cli.js", () => ({
  run: jest.fn(async () => {
    throw new Error("simulated failure");
  }),
}));

describe("bin", () => {
  it("sets process.exitCode = 1 when run() rejects", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    await import("./bin.js");
    await new Promise((resolve) => setImmediate(resolve));

    expect(process.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
    process.exitCode = 0;
  });
});
