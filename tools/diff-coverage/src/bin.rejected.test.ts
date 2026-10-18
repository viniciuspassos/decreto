import { jest } from "@jest/globals";

jest.unstable_mockModule("./cli.js", () => ({
  run: jest.fn(async () => {
    throw new Error("boom");
  }),
}));

describe("bin (run reject)", () => {
  it("define process.exitCode como 1 quando run() rejeita", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    await import("./bin.js");
    await new Promise((resolve) => setImmediate(resolve));

    expect(process.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
    process.exitCode = 0;
  });
});
