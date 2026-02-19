# RyokuChat - セルフホスティングチャットアプリ MVP

## Context

オープンソースのセルフホスティングチャットアプリをゼロから構築する。
MVPとして最低限の機能（ユーザー・チャンネル・メッセージ）を実装し、PWAとして動作させる。
マルチテナント機能は不要。

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js App Router |
| UI | Park UI (Panda CSS variant) + Ark UI |
| ORM | Drizzle ORM + postgres.js |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| PWA | Serwist (@serwist/next) |
| Hosting | Vercel + Supabase |

## Architecture 原則

### VSA (Vertical Slice Architecture)
- `features/` 内は 境界づけられたコンテキスト > ユースケース単位のスライス
- 各スライス = 1ユースケース。そのユースケースに必要な全レイヤーをスライス内に内包
- スライス同士は直接 import しない。共有は親コンテキストの `types.ts`（値オブジェクト定義のみ）に限定
- コンテキスト単位の共有永続化ファイルは作らない。DB操作は各スライスの `repository.ts` に閉じ込める
- 複数スライスで似たクエリが必要でも、まずはコピーを許容しスライス内に閉じる

### DMMF (Domain Modeling Made Functional)
- 状態はビジネスプロセス（ワークフロー）の段階を表す discriminated union で定義
- `Idle / Submitting / Success` のようなUI通信状態は**使わない**（それは React の `useActionState` 等に任せる）
- ドメイン状態の例: `Unvalidated → Validated → Sent` / `Unvalidated → Rejected`
- 状態遷移は `logic.ts` の純粋関数で行う

### スライス内部のレイヤー分離（ファイル単位）

| File | Role |
|---|---|
| `types.ts` | スライス固有のドメイン型（DMMFによる状態定義） |
| `logic.ts` | 純粋関数のみ。バリデーション・計算・状態遷移。外部依存なし |
| `repository.ts` | Drizzle ORM によるDB操作。DB Row ↔ ドメイン型の変換 |
| `action.ts` | Server Action。logic で計算し repository で保存する手順のみ記述 |
| `components/` | UIコンポーネント群。`index.ts` でスライスの公開コンポーネントを barrel export |

### TSDoc 規約
- 全要素に日本語 TSDoc を記載（公開・内部問わず、自明な内容でも）
- データ型フィールドのみ単行コメント、それ以外は複数行コメント
- インラインコメント(`//`)禁止。内部変数に TSDoc を付与してリファクタ
- フィールド間には必ず空行
- `null`/`undefined` のドメイン上の意味は `@remarks` で明記
- TypeScript の値はバッククォートで囲む
- 英単語・半角数字と日本語の間に半角スペース
- `.claude/rules/tsdoc.md` にルール全文を配置し、Claude に遵守させる

---

## ディレクトリ構成

```
ryokuchat/
├── .claude/rules/tsdoc.md             # TSDoc 規約ルールファイル
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
├── supabase/migrations/                # Drizzle Kit + 手動SQL migration
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
    │   │   │
    │   │   ├── sign-up/
    │   │   │   ├── types.ts            # UnvalidatedSignUp, ValidatedSignUp, RejectedSignUp, RegisteredUser
    │   │   │   ├── logic.ts            # validate(unvalidated) → Validated | Rejected
    │   │   │   ├── repository.ts       # (Supabase Auth が処理、profile トリガーで自動作成)
    │   │   │   ├── action.ts           # Server Action: signUp
    │   │   │   └── components/
    │   │   │       ├── index.ts
    │   │   │       └── sign-up-form.tsx
    │   │   │
    │   │   ├── sign-in/
    │   │   │   ├── types.ts            # UnvalidatedSignIn, ValidatedSignIn, RejectedSignIn, AuthenticatedUser
    │   │   │   ├── logic.ts            # validate(unvalidated) → Validated | Rejected
    │   │   │   ├── action.ts           # Server Action: signIn
    │   │   │   └── components/
    │   │   │       ├── index.ts
    │   │   │       └── sign-in-form.tsx
    │   │   │
    │   │   ├── sign-out/
    │   │   │   ├── action.ts           # Server Action: signOut
    │   │   │   └── components/
    │   │   │       ├── index.ts
    │   │   │       └── sign-out-button.tsx
    │   │   │
    │   │   ├── view-profile/
    │   │   │   ├── repository.ts       # findProfileById
    │   │   │   └── components/
    │   │   │       ├── index.ts
    │   │   │       └── profile-view.tsx
    │   │   │
    │   │   └── edit-profile/
    │   │       ├── types.ts            # UnvalidatedProfile, ValidatedProfile, RejectedProfile, UpdatedProfile
    │   │       ├── logic.ts            # validate(unvalidated) → Validated | Rejected
    │   │       ├── repository.ts       # updateProfile
    │   │       ├── action.ts           # Server Action: updateProfile
    │   │       └── components/
    │   │           ├── index.ts
    │   │           └── edit-profile-form.tsx
    │   │
    │   └── chat/                       # ── 境界づけられたコンテキスト: Chat ──
    │       ├── types.ts                # 値オブジェクト: ChannelId, ChannelName, MessageId, MessageContent
    │       │
    │       ├── create-channel/
    │       │   ├── types.ts            # UnvalidatedChannel, ValidatedChannel, RejectedChannel, CreatedChannel
    │       │   ├── logic.ts            # validate(unvalidated) → Validated | Rejected
    │       │   ├── repository.ts       # insertChannel, insertChannelMember
    │       │   ├── action.ts           # Server Action: createChannel
    │       │   └── components/
    │       │       ├── index.ts
    │       │       └── create-channel-dialog.tsx
    │       │
    │       ├── list-channels/
    │       │   ├── repository.ts       # listAllChannels, listJoinedChannelIds
    │       │   └── components/
    │       │       ├── index.ts
    │       │       ├── channel-list.tsx
    │       │       └── channel-card.tsx
    │       │
    │       ├── join-channel/
    │       │   ├── types.ts            # UnjoinedChannel, JoinedChannel
    │       │   ├── repository.ts       # joinChannel, isChannelMember
    │       │   ├── action.ts           # Server Action: joinChannel
    │       │   └── components/
    │       │       ├── index.ts
    │       │       └── join-channel-button.tsx
    │       │
    │       ├── send-message/
    │       │   ├── types.ts            # UnvalidatedMessage, ValidatedMessage, RejectedMessage, SentMessage
    │       │   ├── logic.ts            # validate(unvalidated) → Validated | Rejected
    │       │   ├── repository.ts       # insertMessage
    │       │   ├── action.ts           # Server Action: sendMessage
    │       │   └── components/
    │       │       ├── index.ts
    │       │       └── message-input.tsx
    │       │
    │       ├── list-messages/
    │       │   ├── repository.ts       # listMessagesByChannel
    │       │   └── components/
    │       │       ├── index.ts
    │       │       ├── message-list.tsx
    │       │       └── message-item.tsx
    │       │
    │       └── subscribe-messages/
    │           └── components/
    │               ├── index.ts
    │               └── realtime-messages.tsx  # "use client", Supabase Realtime
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

`src/lib/db/schema.ts` に全テーブルを定義（Drizzle の単一エントリポイント）:

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
- `profiles` 自動作成トリガー (`auth.users` INSERT 時)
- RLS ポリシー
- `alter publication supabase_realtime add table messages`

---

## DMMF ステートモデル（ユースケース単位）

各スライスの `types.ts` に定義。ビジネスプロセスの段階を表す。
UI の通信状態（pending 等）は React の `useActionState` に委譲。

### sign-up
```
UnvalidatedSignUp → ValidatedSignUp → RegisteredUser
                  → RejectedSignUp (reasons を内包)
```

### sign-in
```
UnvalidatedSignIn → ValidatedSignIn → AuthenticatedUser
                  → RejectedSignIn
```

### edit-profile
```
UnvalidatedProfile → ValidatedProfile → UpdatedProfile
                   → RejectedProfile
```

### create-channel
```
UnvalidatedChannel → ValidatedChannel → CreatedChannel
                   → RejectedChannel
```

### join-channel
```
UnjoinedChannel → JoinedChannel
```

### send-message
```
UnvalidatedMessage → ValidatedMessage → SentMessage
                   → RejectedMessage (reasons を内包)
```

---

## 代表的スライスのコード例: `send-message`

全コードは TSDoc 規約に準拠。

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

  /** 送信先チャンネルID(未検証)です。 */
  readonly channelId: string;

  /** 送信者のユーザーID(未検証)です。 */
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

  /** 検証済み送信先チャンネルIDです。 */
  readonly channelId: ChannelId;

  /** 検証済み送信者ユーザーIDです。 */
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

  /** 拒否されたチャンネルID(元の入力値)です。 */
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

  /** 永続化時に採番されたメッセージIDです。 */
  readonly id: MessageId;

  /** 送信済みメッセージ本文です。 */
  readonly content: MessageContent;

  /** 送信先チャンネルIDです。 */
  readonly channelId: ChannelId;

  /** 送信者ユーザーIDです。 */
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
    reasons.push("チャンネルIDは必須です");
  }

  if (input.authorId.length === 0) {
    reasons.push("送信者IDは必須です");
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
 * @param channelId - 送信先チャンネルID(未検証)です。
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

### `features/chat/send-message/components/index.ts`
```typescript
export { MessageInput } from "./message-input";
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
  /** 送信先チャンネルIDです。 */
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

---

## 値オブジェクト（コンテキスト直下 `types.ts`）

スライスから参照される唯一の共有定義。バリデーション付きの branded type のみ。

**`features/user/types.ts`**: `UserId`, `Username`, `DisplayName`, `Email` + create 関数
**`features/chat/types.ts`**: `ChannelId`, `ChannelName`, `MessageId`, `MessageContent` + create 関数

Cross-context: Chat の `types.ts` は `UserId` のみ User から import。

---

## ページとスライスの組み合わせ

| Page | Slices |
|---|---|
| `/login` | sign-in |
| `/signup` | sign-up |
| `/` (home) | list-channels, create-channel, join-channel |
| `/channels/[channelId]` | list-messages, send-message, subscribe-messages |
| `/profile` | view-profile, edit-profile, sign-out |

---

## 実装順序

### Phase 0: プロジェクトルール設定
1. `.claude/rules/tsdoc.md` — TSDoc 規約ルールファイルを配置（ユーザー提供の全文）

### Phase 1: プロジェクト初期化
1. `create-next-app` (TypeScript, App Router, src/, Tailwind なし)
2. Panda CSS + Park UI 初期化
3. Drizzle ORM + postgres.js セットアップ
4. Supabase クライアント (`@supabase/ssr`) セットアップ
5. Serwist PWA セットアップ
6. パスエイリアス (`~/*`)、`.env.local` テンプレート

### Phase 2: インフラ層
1. `src/lib/db/schema.ts` — 全テーブル定義
2. `src/lib/db/index.ts` — Drizzle インスタンス
3. `src/lib/supabase/` — browser.ts, server.ts, middleware.ts
4. `src/middleware.ts` — ルート保護
5. SQL migration — トリガー、RLS、Realtime publication

### Phase 3: User コンテキスト
1. `features/user/types.ts` — 値オブジェクト
2. `features/user/sign-up/` — types, logic, action, components
3. `features/user/sign-in/` — types, logic, action, components
4. `features/user/sign-out/` — action, components
5. `features/user/view-profile/` — repository, components
6. `features/user/edit-profile/` — types, logic, repository, action, components
7. `app/(auth)/` ページ + `app/(main)/profile/` ページ

### Phase 4: Chat コンテキスト
1. `features/chat/types.ts` — 値オブジェクト
2. `features/chat/create-channel/` — types, logic, repository, action, components
3. `features/chat/list-channels/` — repository, components
4. `features/chat/join-channel/` — types, repository, action, components
5. `features/chat/send-message/` — types, logic, repository, action, components
6. `features/chat/list-messages/` — repository, components
7. `features/chat/subscribe-messages/` — components (Supabase Realtime)
8. `app/(main)/` レイアウト + ページ

### Phase 5: PWA + 仕上げ
1. `src/app/manifest.ts`, `src/app/sw.ts`
2. `src/app/~offline/page.tsx`
3. Root layout のメタデータ設定
4. PWA アイコン

---

## 検証方法

1. **認証**: `/signup` → アカウント作成 → 自動リダイレクト → `/login` → サインイン/アウト
2. **チャンネル**: ホームで一覧表示 → 作成ダイアログ → 参加ボタン → メッセージ画面へ遷移
3. **メッセージ**: チャンネルでメッセージ送信 → リアルタイム反映 → 別タブで同期確認
4. **PWA**: `next build --webpack && next start` → DevTools Application で Manifest/SW 確認 → オフラインで `/~offline` 表示
5. **RLS**: 未認証リクエスト拒否、他ユーザーのデータ更新不可を確認
6. **logic.ts の純粋性**: `logic.ts` が import するのは値オブジェクト型・create 関数のみであることを確認
7. **TSDoc 準拠**: 全ファイルが TSDoc 規約に準拠していることを確認
