import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * サーバー用の Supabase クライアントを作成します。
 *
 * @remarks
 * Server Component / Server Action から使用します。
 * Next.js 16 では `cookies()` が非同期 API のため `await` が必要です。
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
