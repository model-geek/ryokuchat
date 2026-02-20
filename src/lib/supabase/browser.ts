import { createBrowserClient } from "@supabase/ssr";

/**
 * ブラウザ用の Supabase クライアントを作成します。
 *
 * @remarks
 * クライアントコンポーネントからの認証・Realtime 操作に使用します。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
