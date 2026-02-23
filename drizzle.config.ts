import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit のマイグレーション設定です。
 *
 * @remarks
 * マイグレーションファイルは `supabase/migrations` に出力されます。
 */
export default defineConfig({
  schema: "src/lib/db/schema.ts",
  out: "supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
