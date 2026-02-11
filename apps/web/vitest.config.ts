import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./setupTests.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["dist", "node_modules"],
  },
});
