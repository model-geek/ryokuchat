# RyokuChat

セルフホスティングチャットアプリ MVP。

## Tech Stack

Next.js App Router / Park UI (Panda CSS) / Drizzle ORM / Supabase / Serwist

## ドキュメント

- docs/architecture.md — アーキテクチャ設計
- docs/packages.md — パッケージバージョンと注意事項
- docs/tsdoc.md — TSDoc 記載規約

## コマンド

```bash
pnpm dev                        # 開発サーバー起動
pnpm build                      # Panda codegen + Next.js ビルド
pnpm panda codegen              # styled-system/ 再生成
pnpm drizzle-kit generate       # マイグレーション生成
pnpm drizzle-kit migrate        # マイグレーション実行
pnpm exec playwright test       # E2E テスト実行
```
