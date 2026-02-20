# TSDoc 記載規約

本ドキュメントは、RyokuChat プロジェクトにおける TSDoc の記載規約を定めたものです。

---

## 1. 基本方針
<!-- sync: .claude/rules/tsdoc.md#基本 -->

- **言語**: 日本語で統一
- **対象**: すべての要素（公開・内部問わず）
- **粒度**: 自明な内容でも日本語で明示的に記載

---

## 2. 対象

### 必須

| 対象 | 説明 |
|---|---|
| 公開関数（export） | ビジネスロジック、ユーティリティ関数など |
| 内部関数 | すべての内部関数 |
| 型定義（type, interface） | 公開・内部問わずすべての型とプロパティ |
| 定数 | 公開・内部問わずすべての定数 |
| クラス・メソッド | 公開・内部問わずすべてのクラスとメソッド |
| 内部変数 | 関数内のすべてのローカル変数 |
| スキーマ定義 | Drizzle スキーマなど |

### 不要

| 対象 | 説明 |
|---|---|
| テストファイル | テストケース名で意図を表現 |
| 生成コード | `generated/`、`styled-system/` 配下の自動生成ファイル |
| 型定義ファイル | `.d.ts` ファイル（外部ライブラリの型定義など） |
| 設定ファイル | `.config.ts` や `*.config.js` などの設定ファイル |

### 自明な内容の記載

英語の識別子を日本語で説明することには価値があります。
自明に見える内容でも、TSDoc の形式で必ず記載してください。

```typescript
/**
 * ユーザー ID です。
 */
const userId = "user_123";

/**
 * 有効フラグです。
 */
const isValid = true;

/**
 * メッセージの配列です。
 */
const messages = [];
```

---

## 3. 記載形式
<!-- sync: .claude/rules/tsdoc.md#形式 -->

### 3.1 単行 / 複数行コメント

**単行コメント**はデータ型（type, interface）のフィールドにのみ使用します。
それ以外の要素（関数、変数、定数など）には**複数行コメント**を使用してください。

```typescript
type Channel = {
  /** チャンネル ID です。 */
  id: string;

  /** チャンネルの表示名です。 */
  name: string;
};
```

```typescript
/**
 * メッセージ一覧をチャンネル ID で絞り込んで取得します。
 *
 * @param channelId - 対象チャンネル ID です。
 * @returns メッセージの配列です。
 */
export function listMessagesByChannel(
  channelId: ChannelId
): Promise<Message[]> {
  // ...
}
```

### 3.2 空行ルール

#### 複数行コメント内の空行

- 説明文と @タグの間には空行を入れる
- @タグ同士の間には空行を入れない
- 説明文が複数段落ある場合は、段落間に空行を入れる

```typescript
// OK: 正しい空行の使い方です。
/**
 * ユーザー情報を取得します。
 *
 * キャッシュが存在する場合はキャッシュから返します。
 * キャッシュが存在しない場合は API から取得します。
 *
 * @param id - ユーザー ID です。
 * @returns ユーザー情報です。
 * @throws {NotFoundError} ユーザーが存在しない場合にスローされます。
 */

// NG: @タグ同士の間に空行があります。
/**
 * ユーザー情報を取得します。
 *
 * @param id - ユーザー ID です。
 *
 * @returns ユーザー情報です。
 *
 * @throws {NotFoundError} ユーザーが存在しない場合にスローされます。
 */

// NG: 説明文と @タグの間に空行がありません。
/**
 * ユーザー情報を取得します。
 * @param id - ユーザー ID です。
 * @returns ユーザー情報です。
 */
```

#### データ型のフィールド間の空行

- フィールド間には必ず空行を入れる
- ネストされたオブジェクト内のフィールド間にも空行を入れる

```typescript
// OK: フィールド間に空行があります。
type User = {
  /** ユーザー ID です。 */
  id: string;

  /** ユーザーの表示名です。 */
  displayName: string;

  /** プロフィール情報です。 */
  profile: {
    /** アバター URL です。 */
    avatarUrl: string;

    /** 自己紹介文です。 */
    bio: string;
  };
};

// NG: フィールド間に空行がありません。
type User = {
  /** ユーザー ID です。 */
  id: string;
  /** ユーザーの表示名です。 */
  displayName: string;
};
```

### 3.3 内部変数のコメント

関数内のすべてのローカル変数に TSDoc コメントを記載します。
インラインコメント（`// コメント`）ではなく、複数行の TSDoc 形式を使用してください。

```typescript
function processMessages(messages: Message[]): Result[] {
  /**
   * 有効なメッセージのみを抽出した配列です。
   */
  const validMessages = messages.filter((msg) => msg.content.length > 0);

  /**
   * 送信日時の昇順でソートされたメッセージの配列です。
   */
  const sortedMessages = validMessages.sort(
    (a, b) => a.sentAt.getTime() - b.sentAt.getTime()
  );

  /**
   * 変換後の結果の配列です。
   */
  const results = sortedMessages.map((msg) => transform(msg));

  return results;
}
```

#### 関数の分割指針

内部変数の TSDoc コメントが多くなった関数は、責務が大きすぎる可能性があります。
以下の場合は関数の分割を検討してください。

- 内部変数が 5 つ以上ある場合
- 複数の処理ステップが連続している場合
- 各ステップが独立した意味を持つ場合

### 3.4 型定義のコメント

型定義自体と、各プロパティにコメントを記載します。

```typescript
/**
 * チャンネル情報を表す型です。
 */
type Channel = {
  /** チャンネルの一意識別子です。 */
  id: string;

  /** チャンネルの表示名です。 */
  name: string;

  /**
   * チャンネルの説明文です。
   *
   * @remarks `null` の場合は説明が未設定であることを表します。
   */
  description: string | null;

  /** チャンネルの作成日時です。 */
  createdAt: Date;
};
```

ネストしたオブジェクトや配列の場合も同様にコメントを記載します。

```typescript
type ChannelConfig = {
  /** 通知設定です。 */
  notification: {
    /** 通知の有効状態です。 */
    enabled: boolean;

    /** 通知の送信間隔(分)です。 */
    intervalMinutes: number;
  };

  /** 許可されたメンバー ID のリストです。 */
  allowedMemberIds: string[];
};
```

### 3.5 スキーマ定義のコメント

Drizzle などのスキーマ定義にもコメントを記載します。

```typescript
/**
 * メッセージテーブルのスキーマです。
 */
const messagesTable = pgTable("messages", {
  /** メッセージの一意識別子です。 */
  id: uuid("id").primaryKey().defaultRandom(),

  /** 送信先チャンネル ID です。 */
  channelId: uuid("channel_id").notNull().references(() => channels.id),

  /** 送信者ユーザー ID です。 */
  authorId: uuid("author_id").notNull().references(() => profiles.id),

  /** メッセージ本文です。 */
  content: text("content").notNull(),

  /** 送信日時です。 */
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

---

## 4. 内容のルール
<!-- sync: .claude/rules/tsdoc.md#内容 -->

### 4.1 ユビキタス言語

TSDoc コメントでは、プロジェクト内で定義されたユビキタス言語（ドメイン用語）を一貫して使用してください。

#### 表記揺れの禁止

同じ概念に対して異なる表現を使用してはいけません。

```typescript
// NG: 表記揺れがあります。
/**
 * ユーザーを取得します。
 */
function getUser() {}

/**
 * 利用者を削除します。  // 「ユーザー」と「利用者」が混在しています。
 */
function deleteUser() {}

// OK: 統一された用語を使用しています。
/**
 * ユーザーを取得します。
 */
function getUser() {}

/**
 * ユーザーを削除します。
 */
function deleteUser() {}
```

#### AI 向けの注意事項

AI が TSDoc を生成する際は、以下のルールに従ってください。

- ドメイン用語が不明な場合は、必ずユーザーに確認してください
- 既存のコードベースから用語を推測せず、明示的に確認してください
- 「メッセージ」「チャンネル」「通知」など、類似した概念がある場合は特に注意してください

### 4.2 自明な内容の記載

英語の識別子を日本語で説明することで、コードの可読性が向上します。
本セクション冒頭「自明な内容の記載」の方針に従ってください。

### 4.3 隠れた意図の記載

本来はアンチパターンですが、既存の実装と合わせるために `undefined` や `optional` 型に「未登録」「未割当て」などのドメイン上の意味を持たせている場合があります。
このような場合は、その値がドメイン目線でどういう意図を表現しているのかを TSDoc に明記してください。

#### null / undefined の意味

```typescript
// NG: null の意味が不明です。
type Channel = {
  /** アーカイブ日時です。 */
  archivedAt: Date | null;
};

// OK: @remarks で `null` がドメイン上で何を意味するかを明記しています。
type Channel = {
  /**
   * アーカイブ日時です。
   *
   * @remarks `null` の場合はアーカイブされていないことを表します。
   */
  archivedAt: Date | null;
};
```

```typescript
// NG: undefined の意味が不明です。
type UserProfile = {
  /** アバター URL です。 */
  avatarUrl?: string;
};

// OK: @remarks で `undefined` がドメイン上で何を意味するかを明記しています。
type UserProfile = {
  /**
   * アバター URL です。
   *
   * @remarks `undefined` の場合はアバターが未設定であることを表します。
   */
  avatarUrl?: string;
};
```

#### 記載が必要なケース

以下のような場合は、必ずドメイン上の意味や制約を明記してください。

- `undefined` が「未登録」「未設定」「未割当て」などを表す場合
- `null` が「存在しない」「削除済み」「未実施」などを表す場合
- 空文字列 `""` が特別な意味を持つ場合
- `0` や `-1` が特別な状態を表す場合
- 数値に範囲制約がある場合（例: 1 以上、0〜100 など）
- 文字列に形式制約がある場合（例: UUID 形式、メールアドレス形式など）

```typescript
// OK: 値の制約を @remarks で明記しています。
type MessageSearchParams = {
  /**
   * ページ番号です。
   *
   * @remarks `1` 以上の整数である必要があります。`0` や負の値は無効です。
   */
  page: number;

  /**
   * 1 ページあたりの表示件数です。
   *
   * @remarks `1`〜`100` の範囲で指定します。デフォルトは `20` です。
   */
  perPage: number;
};
```

#### リテラルユニオンによるステータス表現

リテラルユニオンでステータスを表現している場合は、`@remarks` で各ステータスの意味を説明してください。

```typescript
// NG: 各ステータスの意味が不明です。
type MemberRole = 'owner' | 'admin' | 'member';

// OK: @remarks で各ステータスの意味を説明しています。
/**
 * チャンネルメンバーの権限ロールです。
 *
 * @remarks
 * - `owner`: チャンネルの作成者であり、すべての操作が可能です
 * - `admin`: メンバー管理やチャンネル設定の変更が可能です
 * - `member`: メッセージの送信と閲覧のみ可能です
 */
type MemberRole = 'owner' | 'admin' | 'member';
```

フィールドの型としてリテラルユニオンを使用している場合も同様です。

```typescript
type Notification = {
  /**
   * 通知の既読状態です。
   *
   * @remarks
   * - `unread`: 未読の状態です
   * - `read`: 既読の状態です
   * - `archived`: アーカイブ済みの状態です
   */
  status: 'unread' | 'read' | 'archived';
};
```

### 4.4 詳細度の基準

#### 詳細度の判断フロー

以下のフローチャートに従って詳細度を決定してください。

```
1. 外部公開 API（export され、他モジュールから呼ばれる）？
   → Yes: 高詳細度
   → No: 次へ

2. ドメインロジックを含む（ビジネスルール、計算ロジック）？
   → Yes: 中〜高詳細度
   → No: 次へ

3. 純粋なユーティリティ（汎用的なヘルパー関数）？
   → Yes: 中詳細度
   → No: 次へ

4. 定数・設定値・単純な変数？
   → Yes: 低詳細度
```

#### 高詳細度（詳細な説明が必要）

以下の場合は詳細な説明を記載します。

- 外部から呼び出される API
- 複数の責務を持つ関数・クラス
- 複雑なビジネスロジック
- エッジケースが存在する処理

````typescript
/**
 * メッセージ検索パラメータに基づいてメッセージを取得します。
 *
 * チャンネル ID とページネーション情報をもとにメッセージを検索します。
 * メッセージ数がページサイズより多い場合はページ分割して返却し、
 * メッセージ数が 0 の場合は空配列を返します。
 *
 * ## エッジケース
 * - 指定されたチャンネルが存在しない場合はエラーをスローする
 * - ページ番号がメッセージ総数を超える場合は空配列を返す
 *
 * @param params - メッセージ検索パラメータです。
 * @returns 検索結果のメッセージ配列です。
 *
 * @example
 * ```typescript
 * const messages = await listMessages({
 *   channelId: createChannelId("..."),
 *   page: 1,
 *   perPage: 20,
 * });
 * ```
 */
````

#### 中詳細度（基本情報 + 補足）

通常の公開関数に使用します。

```typescript
/**
 * チャンネル内のメッセージ一覧を取得します。
 * 送信日時の昇順でソートされた結果を返します。
 *
 * @param channelId - 対象チャンネル ID です。
 * @returns メッセージの配列です。
 */
```

#### 低詳細度（単純な定数・変数）

定数や単純な変数に使用します。
単行コメントではなく、複数行コメントの形式で記載してください。

```typescript
/**
 * 1 ページあたりのメッセージ表示件数です。
 */
const MESSAGES_PER_PAGE = 20;

/**
 * メッセージ本文の最大文字数です。
 */
const MAX_MESSAGE_LENGTH = 2000;
```

#### 詳細な説明（複雑な機能）

複雑な機能には、補足説明や Markdown 見出しを活用します。

````typescript
/**
 * リアルタイムメッセージ購読を管理します。
 *
 * Supabase Realtime を使用してチャンネル内の新規メッセージを購読します。
 * コンポーネントのマウント時に購読を開始し、
 * アンマウント時に自動的に購読を解除します。
 *
 * ## 仕様
 * - 購読開始時に既存メッセージは取得しない
 * - 新規メッセージのみリアルタイムで受信
 * - ネットワーク切断時は自動再接続を試みる
 *
 * @example
 * ```typescript
 * const messages = useRealtimeMessages({
 *   channelId: createChannelId("..."),
 * });
 * ```
 */
````

---

## 5. TSDoc タグ

### @param

関数のパラメータを説明する際に使用します。

```typescript
/**
 * 2 つのメッセージの送信日時を比較します。
 *
 * @param a - 比較対象のメッセージ(左辺)です。
 * @param b - 比較対象のメッセージ(右辺)です。
 * @returns `a` が `b` より前なら `-1`、同じなら `0`、後なら `1` を返します。
 */
function compareMessages(a: Message, b: Message): number {
  // ...
}
```

オブジェクトパラメータの場合は、型名で説明を代用できます。

```typescript
/**
 * @param params - メッセージ検索パラメータです。
 */
function listMessages(params: ListMessagesParams): Promise<Message[]> {
  // ...
}
```

### @returns

戻り値を説明する際に使用します。

```typescript
/**
 * @returns チャンネルに属するメッセージの配列です。
 */

/**
 * @returns 見つかったユーザー、または見つからない場合は `null` です。
 */
```

### @example

使用例を示す際に使用します。コードブロックで記載します。

````typescript
/**
 * チャンネル内のメッセージ数を取得します。
 *
 * @example
 * ```typescript
 * const count = await countMessages({
 *   channelId: createChannelId("..."),
 * });
 * ```
 */
````

### @throws

例外をスローする場合に使用します。

```typescript
/**
 * ユーザーを取得します。
 *
 * @param id - ユーザー ID です。
 * @returns ユーザー情報です。
 * @throws {NotFoundError} ユーザーが存在しない場合にスローされます。
 */
```

### @deprecated

非推奨の要素に使用します。

```typescript
/**
 * @deprecated v2.0.0 で削除予定です。代わりに `newFunction` を使用してください。
 */
```

---

## 6. 文体規約
<!-- sync: .claude/rules/tsdoc.md#文体 -->

### 基本ルール

- 文末は「です・ます調」で統一
- 句読点は「、」「。」を使用
- 箇条書きのみ句点は不要

### 半角文字周りのスペース

英単語・半角数字と日本語の間には半角スペースを入れてください。

#### 基本ルール

```typescript
// OK: 英単語・数字の前後にスペース
/** Windows 10 をアップデートします。 */
/** Main メソッドの戻り値は 0 です。 */
/** 最大 5 件まで取得します。 */

// NG: スペースがなく読みにくい
/** Windows10をアップデートします。 */
/** Mainメソッドの戻り値は0です。 */
```

#### 例外（スペースを入れない場合）

以下の場合はスペースを入れません。

1. **句読点・括弧に隣接する場合**
   ```typescript
   /** ID、名前、メールアドレスを取得します。 */  // 「ID、」← 句読点前はスペース不要
   /** ユーザー(User)を削除します。 */  // 括弧内はスペース不要
   ```

2. **複合語（一塊として認識される語）**
   ```typescript
   /** Web サイトの URL を取得します。 */  // 「Webサイト」は複合語
   /** 10px のマージンを設定します。 */  // 「10px」は複合語
   /** 1,000円の課金が発生します。 */  // 「1,000円」は複合語
   ```

3. **数値+単位・助数詞**
   ```typescript
   /** 2つのパラメータを受け取ります。 */  // 「2つ」は数値+助数詞
   /** 2024年4月から開始します。 */  // 「2024年」「4月」は数値+単位
   /** 12ヶ月分のデータを取得します。 */  // 「12ヶ月」は数値+単位
   ```

4. **略語（固有名詞以外）**
   ```typescript
   /** EXEファイルを実行します。 */
   /** DLLを読み込みます。 */
   ```

#### 迷った場合

迷った場合は「スペースを入れる」方を選んでください。

### TypeScript の値・変数名の表記

TypeScript の値（変数名、リテラル値、キーワードなど）を文中で参照する場合は、バッククォートで囲んでください。

```typescript
// OK: バッククォートで囲んでいます
/** `undefined` の場合は未設定を表します。 */
/** `null` の場合は削除済みを表します。 */
/** `a` が `b` より前なら `-1`、同じなら `0`、後なら `1` を返します。 */

// NG: バッククォートで囲んでいません
/** undefined の場合は未設定を表します。 */
/** a が b より前なら -1 を返します。 */
```

### 括弧の使い方

- 補足説明には半角括弧を使用: `(補足)`
- 全角括弧は使用しない: `（補足）` は不可

```typescript
// OK
/** ユーザー ID(UUID 形式)です。 */
/** タイムアウト時間(ミリ秒)です。 */

// NG
/** ユーザー ID（UUID 形式）です。 */  // 全角括弧不可
```

### 例

```typescript
// 単行コメント（データ型のフィールドのみ）
type User = {
  /** 最大表示数です。 */
  maxDisplayCount: number;
};

// 複数行コメント（です・ます調）
/**
 * ユーザー情報を取得します。
 * キャッシュが存在する場合はキャッシュから返します。
 */

// 箇条書き（句点不要）
/**
 * ## 仕様
 * - デフォルトでは最新のメッセージから表示
 * - スクロールで過去のメッセージを遡れる
 */
```

---

## 7. 禁止事項

### インラインコメントの使用

処理の説明にインラインコメント（`// コメント`）を使用してはいけません。
代わりに、内部変数に TSDoc コメントを付けてリファクタリングしてください。

```typescript
// NG: インラインコメントを使用しています。
function filterMessages(messages: Message[]): Message[] {
  // 空のメッセージを除外します。
  const validMessages = messages.filter((msg) => msg.content.length > 0);
  return validMessages;
}

// OK: 内部変数に TSDoc コメントを使用しています。
function filterMessages(messages: Message[]): Message[] {
  /**
   * 空のメッセージを除外した配列です。
   */
  const validMessages = messages.filter((msg) => msg.content.length > 0);
  return validMessages;
}
```

### 古いコメント

コードを変更したらコメントも更新してください。
実装と乖離したコメントは混乱の原因になります。

### 英語と日本語の混在

コメントは日本語で統一してください。

```typescript
// NG
/**
 * Get user by id
 */

// OK
/**
 * ID でユーザーを取得します。
 */
```
