import { defineConfig } from "@playwright/test";

/**
 * Playwright の E2E テスト設定です。
 */
export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "pnpm build && pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
