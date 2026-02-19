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
