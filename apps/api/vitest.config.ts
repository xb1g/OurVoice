import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./wrangler.toml",
        },
      },
    },
  },
});
