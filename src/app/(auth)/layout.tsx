/**
 * 認証ページ用のレイアウトです。
 *
 * @param children - 認証ページのコンテンツです。
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
