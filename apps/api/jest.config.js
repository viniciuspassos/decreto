/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  // Paralelismo padrão do Jest é seguro aqui: cada arquivo de teste cria sua própria
  // instância PGlite isolada (ver src/db/testDb.ts), sem banco/estado compartilhado entre eles.
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text-summary"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
};
