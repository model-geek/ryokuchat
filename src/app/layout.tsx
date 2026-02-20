import type { Metadata } from "next";
import "~/globals.css";

/**
 * アプリケーション全体のメタデータです。
 */
export const metadata: Metadata = {
  title: "RyokuChat",
  description: "セルフホスティングチャットアプリ",
};

/**
 * アプリケーション全体のルートレイアウトです。
 *
 * @param children - 子ページのコンテンツです。
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
