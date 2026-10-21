import { jest } from "@jest/globals";

describe("main", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("renders App inside #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./main.js");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.body.textContent).toContain("Decreto");
  });

  it("throws when #root is missing from index.html", async () => {
    document.body.innerHTML = "";

    await expect(import("./main.js")).rejects.toThrow("#root not found in index.html");
  });
});
