import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "~/lib/supabase/middleware";

/**
 * 認証が不要なルートの一覧です。
 */
const AUTH_ROUTES = ["/login", "/signup", "/auth/callback"];

/**
 * リクエストを認証状態に基づいてルーティングするプロキシです。
 *
 * @remarks
 * Next.js 16 では `middleware.ts` から `proxy.ts` に移行しています。
 * セッション更新後、認証状態に応じてリダイレクトを行います。
 *
 * - 未認証 + 認証ルート以外 → `/login` にリダイレクト
 * - 認証済み + 認証ルート → `/` にリダイレクト
 * - それ以外 → そのまま通過
 *
 * @param request - 受信した HTTP リクエストです。
 * @returns ルーティング結果のレスポンスです。
 */
export default async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

/**
 * プロキシの適用対象を制御するマッチャー設定です。
 *
 * @remarks
 * 静的アセット (`_next/static`, `_next/image`, favicon, 画像ファイル) を除外します。
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
