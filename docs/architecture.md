# アーキテクチャ設計

## 概要

RyokuChat はオープンソースのセルフホスティングチャットアプリです。
MVP として最低限の機能（ユーザー・チャンネル・メッセージ）を実装し、PWA として動作させます。
マルチテナント機能は不要です。

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| UI | Park UI (Panda CSS variant) + Ark UI |
| ORM | Drizzle ORM + postgres.js |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| PWA | Serwist (@serwist/next) |
| Hosting | Vercel + Supabase |

---

## VSA (Vertical Slice Architecture)

### 原則

- `features/` 内は **境界づけられたコンテキスト > ユースケース単位のスライス** で構成します
- 各スライス = 1 ユースケース。そのユースケースに必要な全レイヤーをスライス内に内包します
- 1 スライスが複数のユースケースを担当してはいけません

### 境界づけられたコンテキスト

本プロジェクトでは 2 つのコンテキストを定義します。

| コンテキスト | 責務 | 値オブジェクト |
|---|---|---|
| `user` | 認証・プロフィール管理 | `UserId`, `Username`, `DisplayName`, `Email` |
| `chat` | チャンネル・メッセージ管理 | `ChannelId`, `ChannelName`, `MessageId`, `MessageContent` |

### スライス間の依存ルール

- **スライス同士を直接 import しない**: 共有は親コンテキストの `types.ts`（値オブジェクト定義のみ）に限定します
- **コンテキスト単位の共有永続化ファイルは作らない**: DB 操作は各スライスの `repository.ts` に閉じ込めます
- **コピーを許容する**: 複数スライスで似たクエリが必要でも、まずはコピーを許容しスライス内に閉じます
- **Cross-context**: Chat の `types.ts` は `UserId` のみ User から import します。それ以外の cross-context 依存は禁止です

---

## スライス内部のレイヤー分離

各スライスは以下のファイル構成を持ちます（不要なファイルは省略可）。

| File | Role | 依存先 |
|---|---|---|
| `types.ts` | スライス固有のドメイン型（DMMF による状態定義） | 親コンテキストの types.ts |
| `logic.ts` | 純粋関数のみ。バリデーション・計算・状態遷移 | types.ts、親コンテキストの types.ts |
| `repository.ts` | Drizzle ORM による DB 操作。DB Row ↔ ドメイン型の変換 | types.ts、lib/db |
| `action.ts` | Server Action。logic で計算し repository で保存する手順のみ記述 | logic.ts、repository.ts、lib/supabase |
| `components/` | UI コンポーネント群。`index.ts` でスライスの公開コンポーネントを barrel export | action.ts、types.ts |

### レイヤー間の依存方向

```
types.ts ← logic.ts ← action.ts → repository.ts
                                ↓
                          components/
```

- `logic.ts` は外部依存を持たない純粋関数のみです
- `action.ts` は logic と repository を組み合わせる「手順書」です
- `components/` は `action.ts` を呼び出し、`types.ts` を参照します
- `repository.ts` は `types.ts` と `lib/db` のみに依存します

---

## DMMF (Domain Modeling Made Functional)

### discriminated union による状態モデリング

状態はビジネスプロセス（ワークフロー）の段階を表す discriminated union で定義します。
各状態は `_tag` フィールドで識別します。

```typescript
type SendMessageState =
  | UnvalidatedMessage
  | ValidatedMessage
  | RejectedMessage
  | SentMessage;
```

### UI 通信状態との分離

`Idle / Submitting / Success` のような UI 通信状態はドメイン型に**含めません**。
それは React の `useActionState` 等に任せます。

ドメイン状態はあくまでビジネスプロセスの段階のみを表現します:

- `Unvalidated` → `Validated` → 完了状態
- `Unvalidated` → `Rejected`（バリデーション違反）

### 値オブジェクト（branded type）

コンテキスト直下の `types.ts` にバリデーション付きの branded type を定義します。
これがスライスから参照される唯一の共有定義です。

**`features/user/types.ts`**: `UserId`, `Username`, `DisplayName`, `Email` + create 関数

**`features/chat/types.ts`**: `ChannelId`, `ChannelName`, `MessageId`, `MessageContent` + create 関数

### 各ユースケースのステートモデル一覧

#### sign-up

```
UnvalidatedSignUp → ValidatedSignUp → RegisteredUser
                  → RejectedSignUp (reasons を内包)
```

#### sign-in

```
UnvalidatedSignIn → ValidatedSignIn → AuthenticatedUser
                  → RejectedSignIn
```

#### edit-profile

```
UnvalidatedProfile → ValidatedProfile → UpdatedProfile
                   → RejectedProfile
```

#### create-channel

```
UnvalidatedChannel → ValidatedChannel → CreatedChannel
                   → RejectedChannel
```

#### join-channel

```
UnjoinedChannel → JoinedChannel
```

#### send-message

```
UnvalidatedMessage → ValidatedMessage → SentMessage
                   → RejectedMessage (reasons を内包)
```

---

## ディレクトリ構成

```
ryokuchat/
├── .claude/rules/                      # Claude Code ルールファイル
├── docs/                               # ドキュメント
├── .env.local
├── drizzle.config.ts
├── next.config.ts                      # withSerwist でラップ
├── panda.config.ts                     # Park UI preset
├── postcss.config.cjs
├── tsconfig.json                       # paths: { "~/*": ["./src/*"] }
├── package.json
│
├── public/icons/                       # PWA icons
├── styled-system/                      # (Panda CSS generated, gitignore)
├── supabase/migrations/                # Drizzle Kit + 手動 SQL migration
│
└── src/
    ├── globals.css                     # @layer reset, base, tokens, recipes, utilities
    ├── middleware.ts                    # Auth session refresh + route protection
    │
    ├── app/
    │   ├── layout.tsx                  # Root layout
    │   ├── manifest.ts                 # PWA manifest
    │   ├── sw.ts                       # Serwist service worker
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx          # → sign-in/components
    │   │   └── signup/page.tsx         # → sign-up/components
    │   ├── (main)/
    │   │   ├── layout.tsx              # 認証済みレイアウト
    │   │   ├── page.tsx                # → list-channels + create-channel + join-channel
    │   │   ├── channels/[channelId]/page.tsx  # → list-messages + send-message + subscribe-messages
    │   │   └── profile/page.tsx        # → view-profile + edit-profile + sign-out
    │   ├── auth/callback/route.ts
    │   └── ~offline/page.tsx
    │
    ├── components/ui/                  # Park UI components (@park-ui/cli add)
    │
    ├── features/
    │   ├── user/                       # ── 境界づけられたコンテキスト: User ──
    │   │   ├── types.ts                # 値オブジェクト: UserId, Username, DisplayName, Email
    │   │   ├── sign-up/
    │   │   │   ├── types.ts
    │   │   │   ├── logic.ts
    │   │   │   ├── repository.ts
    │   │   │   ├── action.ts
    │   │   │   └── components/
    │   │   ├── sign-in/
    │   │   │   ├── types.ts
    │   │   │   ├── logic.ts
    │   │   │   ├── action.ts
    │   │   │   └── components/
    │   │   ├── sign-out/
    │   │   │   ├── action.ts
    │   │   │   └── components/
    │   │   ├── view-profile/
    │   │   │   ├── repository.ts
    │   │   │   └── components/
    │   │   └── edit-profile/
    │   │       ├── types.ts
    │   │       ├── logic.ts
    │   │       ├── repository.ts
    │   │       ├── action.ts
    │   │       └── components/
    │   │
    │   └── chat/                       # ── 境界づけられたコンテキスト: Chat ──
    │       ├── types.ts                # 値オブジェクト: ChannelId, ChannelName, MessageId, MessageContent
    │       ├── create-channel/
    │       │   ├── types.ts
    │       │   ├── logic.ts
    │       │   ├── repository.ts
    │       │   ├── action.ts
    │       │   └── components/
    │       ├── list-channels/
    │       │   ├── repository.ts
    │       │   └── components/
    │       ├── join-channel/
    │       │   ├── types.ts
    │       │   ├── repository.ts
    │       │   ├── action.ts
    │       │   └── components/
    │       ├── send-message/
    │       │   ├── types.ts
    │       │   ├── logic.ts
    │       │   ├── repository.ts
    │       │   ├── action.ts
    │       │   └── components/
    │       ├── list-messages/
    │       │   ├── repository.ts
    │       │   └── components/
    │       └── subscribe-messages/
    │           └── components/
    │
    └── lib/
        ├── supabase/
        │   ├── browser.ts
        │   ├── server.ts
        │   └── middleware.ts
        └── db/
            ├── index.ts                # Drizzle instance (postgres.js, prepare: false)
            └── schema.ts               # 全テーブル定義
```

---

## DB スキーマ

`src/lib/db/schema.ts` に全テーブルを定義します（Drizzle の単一エントリポイント）。

```
profiles
  id          uuid PK (= auth.users.id, trigger で自動生成)
  username    text NOT NULL UNIQUE
  display_name text
  avatar_url  text
  created_at  timestamptz NOT NULL DEFAULT now()
  updated_at  timestamptz NOT NULL DEFAULT now()

channels
  id          uuid PK DEFAULT gen_random_uuid()
  name        text NOT NULL
  description text
  created_by  uuid NOT NULL FK → profiles.id
  created_at  timestamptz NOT NULL DEFAULT now()
  archived_at timestamptz

channel_members
  channel_id  uuid FK → channels.id  ┐
  profile_id  uuid FK → profiles.id  ┘ composite PK
  joined_at   timestamptz NOT NULL DEFAULT now()
  INDEX (channel_id), INDEX (profile_id)

messages
  id          uuid PK DEFAULT gen_random_uuid()
  channel_id  uuid NOT NULL FK → channels.id
  author_id   uuid NOT NULL FK → profiles.id
  content     text NOT NULL
  created_at  timestamptz NOT NULL DEFAULT now()
  INDEX (channel_id, created_at)
```

SQL migration で追加:

- `profiles` 自動作成トリガー（`auth.users` INSERT 時）
- RLS ポリシー
- `alter publication supabase_realtime add table messages`

---

## ページとスライスの対応表

| Page | Slices |
|---|---|
| `/login` | sign-in |
| `/signup` | sign-up |
| `/` (home) | list-channels, create-channel, join-channel |
| `/channels/[channelId]` | list-messages, send-message, subscribe-messages |
| `/profile` | view-profile, edit-profile, sign-out |

---

## コード例: send-message スライス

全コードは TSDoc 規約に準拠しています。

### `features/chat/send-message/types.ts`

```typescript
import type { ChannelId, MessageId, MessageContent } from "~/features/chat/types";
import type { UserId } from "~/features/user/types";

/**
 * メッセージ送信ユースケースのドメイン状態です。
 *
 * @remarks
 * - `UnvalidatedMessage`: ユーザー入力直後の未検証状態
 * - `ValidatedMessage`: ビジネスルールを通過し、永続化可能な状態
 * - `RejectedMessage`: バリデーション違反により拒否された状態
 * - `SentMessage`: 永続化まで完了した状態
 */
export type SendMessageState =
  | UnvalidatedMessage
  | ValidatedMessage
  | RejectedMessage
  | SentMessage;

/**
 * ユーザー入力直後の未検証メッセージです。
 */
export interface UnvalidatedMessage {
  /** 状態識別タグです。 */
  readonly _tag: "UnvalidatedMessage";

  /** ユーザーが入力したメッセージ本文(未検証)です。 */
  readonly content: string;

  /** 送信先チャンネル ID(未検証)です。 */
  readonly channelId: string;

  /** 送信者のユーザー ID(未検証)です。 */
  readonly authorId: string;
}

/**
 * バリデーション通過済みの送信可能なメッセージです。
 */
export interface ValidatedMessage {
  /** 状態識別タグです。 */
  readonly _tag: "ValidatedMessage";

  /** 検証済みメッセージ本文です。 */
  readonly content: MessageContent;

  /** 検証済み送信先チャンネル ID です。 */
  readonly channelId: ChannelId;

  /** 検証済み送信者ユーザー ID です。 */
  readonly authorId: UserId;
}

/**
 * バリデーション違反により拒否されたメッセージです。
 */
export interface RejectedMessage {
  /** 状態識別タグです。 */
  readonly _tag: "RejectedMessage";

  /** 拒否されたメッセージ本文(元の入力値)です。 */
  readonly content: string;

  /** 拒否されたチャンネル ID(元の入力値)です。 */
  readonly channelId: string;

  /** 拒否理由の一覧です。 */
  readonly reasons: readonly string[];
}

/**
 * 永続化まで完了した送信済みメッセージです。
 */
export interface SentMessage {
  /** 状態識別タグです。 */
  readonly _tag: "SentMessage";

  /** 永続化時に採番されたメッセージ ID です。 */
  readonly id: MessageId;

  /** 送信済みメッセージ本文です。 */
  readonly content: MessageContent;

  /** 送信先チャンネル ID です。 */
  readonly channelId: ChannelId;

  /** 送信者ユーザー ID です。 */
  readonly authorId: UserId;

  /** メッセージの送信日時です。 */
  readonly sentAt: Date;
}
```

### `features/chat/send-message/logic.ts`

```typescript
import {
  createChannelId,
  createMessageContent,
  type MessageContent,
} from "~/features/chat/types";
import { createUserId } from "~/features/user/types";
import { isError } from "~/features/user/types";
import type {
  UnvalidatedMessage,
  ValidatedMessage,
  RejectedMessage,
} from "./types";

/**
 * 未検証メッセージをバリデーションし、検証済みまたは拒否状態に遷移させます。
 *
 * @param input - 未検証メッセージです。
 * @returns 検証済みメッセージ、またはバリデーション違反時は拒否されたメッセージです。
 */
export function validate(
  input: UnvalidatedMessage
): ValidatedMessage | RejectedMessage {
  /**
   * バリデーション違反理由を蓄積する配列です。
   */
  const reasons: string[] = [];

  /**
   * メッセージ本文の検証結果です。
   */
  const content = createMessageContent(input.content);
  if (isError(content)) {
    reasons.push(content.error);
  }

  if (input.channelId.length === 0) {
    reasons.push("チャンネル ID は必須です");
  }

  if (input.authorId.length === 0) {
    reasons.push("送信者 ID は必須です");
  }

  if (reasons.length > 0) {
    return {
      _tag: "RejectedMessage",
      content: input.content,
      channelId: input.channelId,
      reasons,
    };
  }

  return {
    _tag: "ValidatedMessage",
    content: content as MessageContent,
    channelId: createChannelId(input.channelId),
    authorId: createUserId(input.authorId),
  };
}
```

### `features/chat/send-message/repository.ts`

```typescript
import { db } from "~/lib/db";
import { messages } from "~/lib/db/schema";
import { createMessageId } from "~/features/chat/types";
import type { ValidatedMessage, SentMessage } from "./types";

/**
 * 検証済みメッセージを DB に永続化し、送信済み状態に遷移させます。
 *
 * @param validated - 検証済みメッセージです。
 * @returns 永続化完了後の送信済みメッセージです。
 */
export async function persist(
  validated: ValidatedMessage
): Promise<SentMessage> {
  /**
   * DB に挿入された行です。
   */
  const [row] = await db
    .insert(messages)
    .values({
      channelId: validated.channelId,
      authorId: validated.authorId,
      content: validated.content,
    })
    .returning();

  return {
    _tag: "SentMessage",
    id: createMessageId(row.id),
    content: validated.content,
    channelId: validated.channelId,
    authorId: validated.authorId,
    sentAt: row.createdAt,
  };
}
```

### `features/chat/send-message/action.ts`

```typescript
"use server";

import { createClient } from "~/lib/supabase/server";
import type { UnvalidatedMessage, SentMessage, RejectedMessage } from "./types";
import { validate } from "./logic";
import { persist } from "./repository";

/**
 * 指定チャンネルにメッセージを送信します。
 *
 * @param channelId - 送信先チャンネル ID(未検証)です。
 * @param content - メッセージ本文(未検証)です。
 * @returns 送信済みメッセージ、またはバリデーション違反時は拒否されたメッセージです。
 */
export async function sendMessage(
  channelId: string,
  content: string
): Promise<SentMessage | RejectedMessage> {
  /**
   * Supabase サーバークライアントです。
   */
  const supabase = await createClient();

  /**
   * 認証済みユーザー情報の取得結果です。
   */
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      _tag: "RejectedMessage",
      content,
      channelId,
      reasons: ["認証されていません"],
    };
  }

  /**
   * 未検証メッセージのドメインオブジェクトです。
   */
  const input: UnvalidatedMessage = {
    _tag: "UnvalidatedMessage",
    content,
    channelId,
    authorId: user.id,
  };

  /**
   * バリデーション結果です。
   */
  const result = validate(input);
  if (result._tag === "RejectedMessage") {
    return result;
  }

  return persist(result);
}
```

### `features/chat/send-message/components/message-input.tsx`

```typescript
"use client";

import { useActionState } from "react";
import { sendMessage } from "../action";
import type { SentMessage, RejectedMessage } from "../types";

/**
 * メッセージ入力コンポーネントの Props です。
 */
interface Props {
  /** 送信先チャンネル ID です。 */
  channelId: string;
}

/**
 * メッセージ送信フォームです。
 *
 * @param props - コンポーネント Props です。
 * @returns メッセージ入力フォームです。
 */
export function MessageInput({ channelId }: Props) {
  /**
   * Server Action の実行状態です。
   */
  const [state, formAction, isPending] = useActionState(
    async (
      _prev: SentMessage | RejectedMessage | null,
      formData: FormData
    ) => {
      /**
       * ユーザーが入力したメッセージ本文です。
       */
      const content = formData.get("content") as string;

      return sendMessage(channelId, content);
    },
    null
  );

  return (
    <form action={formAction}>
      <input
        name="content"
        placeholder="メッセージを入力..."
        disabled={isPending}
        autoComplete="off"
      />
      <button type="submit" disabled={isPending}>
        送信
      </button>
      {state?._tag === "RejectedMessage" && (
        <p>{state.reasons.join(", ")}</p>
      )}
    </form>
  );
}
```
