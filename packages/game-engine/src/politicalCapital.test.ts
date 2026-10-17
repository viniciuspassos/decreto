import { addCapital } from "./politicalCapital.js";

describe("addCapital", () => {
  it("soma o capital ganho ao capital atual", () => {
    expect(addCapital(10, 5)).toBe(15);
  });

  it("aceita ganho zero sem alterar o capital", () => {
    expect(addCapital(10, 0)).toBe(10);
  });
});
