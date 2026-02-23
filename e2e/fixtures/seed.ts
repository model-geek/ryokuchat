import { createClient } from "@supabase/supabase-js";

/**
 * テスト用の Supabase Admin クライアントです。
 *
 * @remarks
 * Service Role Key を使用するため、RLS をバイパスします。
 * E2E テストのセットアップ・ティアダウン専用です。
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * テストユーザーの情報です。
 */
export interface TestUser {
  /** ユーザーの一意識別子です。 */
  id: string;

  /** テスト用のメールアドレスです。 */
  email: string;

  /** テスト用のパスワードです。 */
  password: string;
}

/**
 * テスト用ユーザーを作成します。
 *
 * @remarks
 * `email_confirm: true` を指定することで、メール確認をスキップします。
 * メールアドレスは `test-{Date.now()}@example.com` 形式で一意性を保証します。
 *
 * @returns 作成されたテストユーザーの情報です。
 */
export async function createTestUser(): Promise<TestUser> {
  const email = `test-${Date.now()}@example.com`;
  const password = `test-password-${Date.now()}`;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`テストユーザーの作成に失敗しました: ${error.message}`);
  }

  return { id: data.user.id, email, password };
}

/**
 * テスト用ユーザーを削除します。
 *
 * @param userId - 削除するユーザーの ID です。
 */
export async function deleteTestUser(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(`テストユーザーの削除に失敗しました: ${error.message}`);
  }
}
