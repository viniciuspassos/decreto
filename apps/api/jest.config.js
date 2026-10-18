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
  // Testes de src/db e src/routes compartilham um único Postgres real entre
  // arquivos; rodar em série evita corrida entre eles (ver event_images).
  maxWorkers: 1,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text-summary"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
};
