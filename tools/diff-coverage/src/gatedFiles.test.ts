import { filterGatedChanges } from "./gatedFiles.js";
import type { ChangedLinesByFile } from "./types.js";

function changes(entries: [string, number[]][]): ChangedLinesByFile {
  return new Map(entries.map(([file, lines]) => [file, new Set(lines)]));
}

describe("filterGatedChanges", () => {
  it("mantém arquivos de código-fonte em apps e packages", () => {
    const input = changes([
      ["apps/api/src/app.ts", [1]],
      ["packages/game-engine/src/politicalCapital.ts", [2]],
      ["tools/diff-coverage/src/cli.ts", [3]],
    ]);

    expect([...filterGatedChanges(input).keys()]).toEqual([
      "apps/api/src/app.ts",
      "packages/game-engine/src/politicalCapital.ts",
      "tools/diff-coverage/src/cli.ts",
    ]);
  });

  it("descarta arquivos de teste, docs e configs fora de src", () => {
    const input = changes([
      ["apps/api/src/app.test.ts", [1]],
      ["docs/INFRASTRUCTURE.md", [1]],
      ["packages/game-engine/jest.config.js", [1]],
      ["package.json", [1]],
    ]);

    expect(filterGatedChanges(input).size).toBe(0);
  });
});
