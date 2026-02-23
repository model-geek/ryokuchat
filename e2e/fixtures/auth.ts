import { test as base, type Page } from "@playwright/test";
import { createTestUser, deleteTestUser, type TestUser } from "./seed";

/**
 * 認証付き E2E テストの fixture 型です。
 */
interface AuthFixtures {
  /** テストごとに一意なテストユーザーです。ティアダウンで自動削除されます。 */
  testUser: TestUser;

  /** テストユーザーでログイン済みの独立したブラウザページです。 */
  authedPage: Page;
}

/**
 * 認証付きの Playwright テスト fixture です。
 *
 * @remarks
 * `testUser` はテストごとに新規作成され、テスト終了時に自動削除されます。
 * `authedPage` は独立したブラウザコンテキストで Supabase にサインイン済みです。
 */
export const test = base.extend<AuthFixtures>({
  testUser: async ({}, use) => {
    const user = await createTestUser();
    await use(user);
    await deleteTestUser(user.id);
  },

  authedPage: async ({ browser, testUser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    await page.evaluate(
      async ({ email, password, supabaseUrl, supabaseAnonKey }) => {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          throw new Error(`サインインに失敗しました: ${error.message}`);
        }
      },
      {
        email: testUser.email,
        password: testUser.password,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    );

    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
