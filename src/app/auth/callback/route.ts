import { NextResponse } from "next/server";
import { createClient } from "~/lib/supabase/server";

/**
 * OAuth コールバックを処理するルートハンドラです。
 *
 * @remarks
 * OAuth プロバイダからリダイレクトされた認証コードを
 * セッションに交換します。
 *
 * @param request - 認証コードを含むリクエストです。
 * @returns 認証結果に応じたリダイレクトレスポンスです。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
