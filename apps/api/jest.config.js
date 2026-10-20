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
  // Várias instâncias PGlite em paralelo deixam os testes de HTTP instáveis em máquinas locais e no CI.
  maxWorkers: 1,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text-summary"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
};
