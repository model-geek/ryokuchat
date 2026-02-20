import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Supabase Transaction mode 用の PostgreSQL クライアントです。
 *
 * @remarks
 * Supabase の Transaction mode (デフォルト) では `prepare: false` が必要です。
 */
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

/**
 * Drizzle ORM のデータベースインスタンスです。
 */
export const db = drizzle({ client });
