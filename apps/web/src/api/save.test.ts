import { clearGameId, loadGameId, storeGameId } from "./save.js";

describe("saved game ID", () => {
  beforeEach(() => localStorage.clear());
  it("persists and clears a game ID", () => {
    expect(loadGameId()).toBeNull();
    storeGameId("game-1");
    expect(loadGameId()).toBe("game-1");
    clearGameId();
    expect(loadGameId()).toBeNull();
  });
});
