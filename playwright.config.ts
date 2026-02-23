import { loadEnvConfig } from "@next/env";
import { defineConfig } from "@playwright/test";

/**
 * `.env.test` から環境変数を読み込みます。
 *
 * @remarks
 * `@next/env` は `NODE_ENV=test` のとき `.env.test` を読み込みます。
 * webServer サブプロセスは `process.env` を継承するため、
 * ここでセットした値がビルド・起動時にも反映されます。
 */
process.env.NODE_ENV = "test";
loadEnvConfig(process.cwd());

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
