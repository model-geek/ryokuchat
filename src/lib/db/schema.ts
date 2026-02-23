import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * ユーザープロフィールテーブルです。
 *
 * @remarks
 * `id` は `auth.users.id` と一致させます。
 * sign-up Action で明示的にセットするため `defaultRandom()` は使用しません。
 */
export const profiles = pgTable("profiles", {
  /** ユーザーの一意識別子です。`auth.users.id` と同じ値をセットします。 */
  id: uuid("id").primaryKey(),

  /** ユーザー名です。一意制約があります。 */
  username: text("username").unique().notNull(),

  /** 表示名です。未設定の場合は `null` です。 */
  displayName: text("display_name"),

  /** アバター画像の URL です。未設定の場合は `null` です。 */
  avatarUrl: text("avatar_url"),

  /** レコードの作成日時です。 */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  /** レコードの最終更新日時です。 */
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * チャンネルテーブルです。
 */
export const channels = pgTable("channels", {
  /** チャンネルの一意識別子です。 */
  id: uuid("id").primaryKey().defaultRandom(),

  /** チャンネル名です。 */
  name: text("name").notNull(),

  /** チャンネルの説明です。未設定の場合は `null` です。 */
  description: text("description"),

  /** チャンネルを作成したユーザーの ID です。 */
  createdBy: uuid("created_by")
    .notNull()
    .references(() => profiles.id),

  /** チャンネルの作成日時です。 */
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  /** チャンネルのアーカイブ日時です。アーカイブされていない場合は `null` です。 */
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

/**
 * チャンネルメンバーテーブルです。
 *
 * @remarks
 * `channel_id` と `profile_id` の複合主キーで構成されます。
 */
export const channelMembers = pgTable(
  "channel_members",
  {
    /** 所属するチャンネルの ID です。 */
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id),

    /** メンバーのプロフィール ID です。 */
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),

    /** チャンネルに参加した日時です。 */
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.channelId, table.profileId] }),
    index("channel_members_channel_id_idx").on(table.channelId),
    index("channel_members_profile_id_idx").on(table.profileId),
  ],
);

/**
 * メッセージテーブルです。
 */
export const messages = pgTable(
  "messages",
  {
    /** メッセージの一意識別子です。 */
    id: uuid("id").primaryKey().defaultRandom(),

    /** メッセージが投稿されたチャンネルの ID です。 */
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id),

    /** メッセージの投稿者のプロフィール ID です。 */
    authorId: uuid("author_id")
      .notNull()
      .references(() => profiles.id),

    /** メッセージの本文です。 */
    content: text("content").notNull(),

    /** メッセージの投稿日時です。 */
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("messages_channel_id_created_at_idx").on(
      table.channelId,
      table.createdAt,
    ),
  ],
);
