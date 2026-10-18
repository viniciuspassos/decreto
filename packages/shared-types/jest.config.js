/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  passWithNoTests: true,
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true }],
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text-summary"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
};
