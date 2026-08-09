import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

const createConfig = createJestConfig(config);

async function getJestConfig() {
  const resolvedConfig = await createConfig();

  return {
    ...resolvedConfig,
    transformIgnorePatterns: ["^.+\\.module\\.(css|sass|scss)$"],
  } satisfies Config;
}

export default getJestConfig;
