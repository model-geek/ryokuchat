import { readFileSync } from "node:fs";
import { defineConfig } from "@playwright/test";

/**
 * `.env.test` から環境変数を読み込みます。
 *
 * @remarks
 * Next.js は `NODE_ENV=test` でのみ `.env.test` を自動読み込みするため、
 * Playwright のプロセスおよび webServer サブプロセスに明示的にセットします。
 */
const envFile = readFileSync(".env.test", "utf-8");
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.slice(0, eqIndex);
  const value = trimmed.slice(eqIndex + 1);
  process.env[key] = value;
}

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
