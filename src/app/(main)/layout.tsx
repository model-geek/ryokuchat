/**
 * 認証済みユーザー用のレイアウトです。
 *
 * @param children - メインページのコンテンツです。
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
