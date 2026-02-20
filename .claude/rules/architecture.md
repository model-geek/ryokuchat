# アーキテクチャルール

> 詳細: docs/architecture.md

## ディレクトリ配置

- スライスは src/features/{context}/{use-case}/ に配置
- 境界づけられたコンテキスト: user, chat

## スライス構成

- types.ts — DMMF 状態定義
- logic.ts — 純粋関数のみ（外部依存禁止）
- repository.ts — Drizzle DB 操作
- action.ts — Server Action（logic → repository の手順）
- subscriber.ts — クライアント側 Realtime 購読（action.ts と同列のプレゼンテーション層）
- components/ — UI。index.ts で barrel export

## 依存ルール

- スライス同士を直接 import しない
- 共有は親コンテキストの types.ts のみ
- cross-context は UserId 型のみ

## DMMF

- Unvalidated → Validated → 完了 / Rejected
- UI 通信状態はドメイン型に含めない（useActionState に委譲）
- 値オブジェクトは branded type

## インフラ

- Drizzle スキーマ: src/lib/db/schema.ts
- Supabase クライアント: src/lib/supabase/
- サーバー側は getUser()（getSession() 禁止）

## コンポーネント命名

- SC/CC 分割時にフレームワーク接尾辞 (-client, -container) は付けない
- ドメイン粒度で命名: 全体 (Messages) → リスト (MessageList) → アイテム (MessageItem)
- コンポーネントからインフラ (Supabase 等) を直接 import しない

## E2E テスト

- Playwright を使用。テストは e2e/ に配置
- ファイル名: {use-case}.test.ts (例: sign-up.test.ts)
- fixture で認証・テストデータを管理 (e2e/fixtures/)
- テストデータは `test-{Date.now()}@example.com` で一意性保証
- teardown で個別クリーンアップ (supabase db reset は使わない)

## 同期

- docs/architecture.md を変更した場合は、このファイルの対応セクションも同期してください
