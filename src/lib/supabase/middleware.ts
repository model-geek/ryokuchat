import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

/**
 * セッション更新の結果です。
 */
export interface SessionResult {
  /** セッション Cookie を更新したレスポンスです。 */
  response: NextResponse;

  /** 認証済みユーザーです。未認証の場合は `null` です。 */
  user: User | null;
}

/**
 * Supabase Auth のセッションを更新します。
 *
 * @remarks
 * `proxy.ts` から呼び出されるヘルパーです。
 * リクエストごとにセッションの有効期限を確認し、
 * 必要に応じてトークンをリフレッシュします。
 *
 * @param request - 受信した HTTP リクエストです。
 * @returns セッション Cookie を更新したレスポンスと認証ユーザー情報です。
 */
export async function updateSession(
  request: NextRequest,
): Promise<SessionResult> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user };
}
