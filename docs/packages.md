# パッケージバージョンと注意事項

> 2026-02-20 時点の調査結果

## バージョン一覧

| パッケージ | バージョン | 備考 |
|---|---|---|
| `next` | 16.1.6 | Turbopack がデフォルト化 |
| `react` / `react-dom` | 19.2 (Next.js 16 同梱) | |
| `@pandacss/dev` | 1.6.0 | v1 GA 済み |
| `@park-ui/cli` | 1.0.1 | preset 方式からローカル recipe 方式に移行 |
| `@ark-ui/react` | 5.31.0 | v5 でパフォーマンス大幅改善 |
| `drizzle-orm` | 0.45.1 | v1 は beta (本番では 0.x 推奨) |
| `drizzle-kit` | 0.31.9 | |
| `postgres` | 3.4.8 | |
| `@supabase/supabase-js` | 2.97.0 | |
| `@supabase/ssr` | 0.8.0 | `supabase-js` とは別パッケージのまま |
| `supabase` (CLI) | 2.76.11 | |
| `serwist` | 9.5.6 | devDependency |
| `@serwist/next` | 9.5.4 | dependency |
| `@playwright/test` | 1.58.2 | |

---

## AI の学習データと乖離が大きい変更点

### Next.js 16: `middleware.ts` → `proxy.ts`

`middleware.ts` は非推奨になり `proxy.ts` に置き換わりました。

```ts
// proxy.ts (Node.js ランタイムで動作)
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

- エクスポート関数名: `middleware` → `proxy`
- ランタイム: Edge → **Node.js** (デフォルト)
- 設定名: `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`

### Next.js 16: 非同期リクエスト API の強制化

Next.js 15 では同期アクセスが警告付きで動作していましたが、16 では完全に削除されました。

```ts
// NG (Next.js 16 では動かない)
const cookieStore = cookies();
const { slug } = params;

// OK
const cookieStore = await cookies();
const { slug } = await params;
```

`next typegen` コマンドで `PageProps`, `LayoutProps` 等の型ヘルパーを自動生成できます。

### Next.js 16: Turbopack がデフォルト

- `next dev` / `next build` の両方でデフォルトバンドラーに
- `--turbopack` フラグは不要に
- カスタム `webpack` 設定がある場合は `--webpack` フラグが必要
- 設定が `experimental.turbopack` → トップレベル `turbopack` に移動

### Next.js 16: `next lint` の削除

`next lint` コマンドは完全に削除されました。ESLint または Biome を直接使用する必要があります。

```bash
# 移行用 codemod
npx @next/codemod@canary next-lint-to-eslint-cli .
```

### Next.js 16: キャッシュモデルの刷新

- `experimental.ppr` と `experimental.dynamicIO` は削除
- 新しいトップレベル設定 `cacheComponents: true` に統合
- `"use cache"` ディレクティブによるオプトインキャッシュ
- `cacheLife` / `cacheTag` が安定化 (`unstable_` プレフィックス不要)

### Next.js 16: その他の削除

| 削除された機能 | 代替 |
|---|---|
| AMP サポート | なし |
| `serverRuntimeConfig` / `publicRuntimeConfig` | `.env` |
| `next/legacy/image` | `next/image` |
| `images.domains` | `images.remotePatterns` |
| `NextRequest` の `geo` / `ip` | `@vercel/functions` |

### Next.js 16: Node.js 要件

Node.js 20.9 以上が必要です (Node.js 18 はサポート終了)。

---

### Park UI: preset 方式の廃止

`@park-ui/panda-preset` は非推奨 (deprecated) です。新規プロジェクトでは使用しません。

```bash
# 旧方式 (使わない)
npm install @park-ui/panda-preset

# 新方式: CLI でコンポーネントと recipe をローカルに生成
npx @park-ui/cli init
npx @park-ui/cli components add button card avatar
```

生成された recipe を `panda.config.ts` に登録します。

```ts
import { recipes, slotRecipes } from "~/theme/recipes";

export default defineConfig({
  theme: {
    extend: {
      recipes,
      slotRecipes,
    },
  },
});
```

**破壊的変更:**
- `RadioButtonGroup` → `RadioCardGroup` にリネーム
- `FormLabel` 削除 → `Field` コンポーネントに統合

---

### Ark UI v5: テストの非同期化

v5 で React のネイティブリアクティブプリミティブに移行したため、テストで open/close 状態を検証する際は非同期にする必要があります。

```ts
// v4
expect(screen.getByRole("dialog")).toBeInTheDocument();

// v5
expect(await screen.findByRole("dialog")).toBeInTheDocument();
```

**削除されたコンポーネント:** `TimePicker` (代替: `Select` で構築)

---

### Panda CSS v1: トークン名の変更

| 旧 | 新 |
|---|---|
| `shadows.inner` | `shadows.inset-sm` |
| `blurs.sm` | `blurs.xs` |
| `blurs.base` | `blurs.sm` |

---

### Supabase: Cookie API の変更

`get` / `set` / `remove` は非推奨です。`getAll` / `setAll` のみを使用します。

```ts
createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  cookies: {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) =>
        cookieStore.set(name, value, options)
      );
    },
  },
});
```

### Supabase: API キーの移行

2025 年 5 月以降の新規プロジェクトでは `anon` / `service_role` キーから `sb_publishable_...` / `sb_secret_...` キーに移行しています。レガシーキーは 2026 年末に削除予定です。ローカル開発 (Supabase CLI) では従来の固定キーが引き続き使用できます。

### Supabase: Realtime の改善

- **Broadcast from Database**: `realtime.broadcast_changes()` + Postgres トリガーで行変更を自動ブロードキャスト
- **Private channels**: データベースブロードキャストではデフォルトでプライベートチャンネルが使用される
- スケール時は Postgres Changes より Broadcast の使用が推奨

---

### Serwist: API の統合

旧 API (`installSerwist`) は非推奨です。`Serwist` クラスを使用します。

```ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
```

**注意点:**
- `@serwist/next/browser` → `@serwist/next/worker` にインポートパスが変更
- `cacheOnFrontEndNav` → `cacheOnNavigation` にリネーム
- `RuntimeCaching.urlPattern` → `RuntimeCaching.matcher` にリネーム
- `serwist` は devDependency、`@serwist/next` は dependency としてインストール

### Serwist + Next.js 16 (Turbopack)

Next.js 16 は Turbopack がデフォルトですが、`next build` は引き続き webpack を使用します。`@serwist/next` は webpack ベースのため、本番ビルドでは問題ありません。開発時は `disable: process.env.NODE_ENV === "development"` で無効化します。

---

### Playwright 1.58: 主な変更点

- `webServer.wait` オプション追加 (Next.js の起動検知に有用)
- Service Worker ネットワークリクエストのルーティング対応 (Chromium、実験的)
- IndexedDB が `storageState()` に含まれるように (v1.51)
- Node.js 18 は非推奨 → Node.js 20+ を使用
- `page.accessibility` 削除 → Axe を使用

---

## 組み合わせ時の注意事項

### Next.js 16 + `proxy.ts` + Supabase Auth

Supabase Auth のセッションリフレッシュは `middleware.ts` の `updateSession()` パターンが公式ドキュメントで推奨されていますが、Next.js 16 では `proxy.ts` に移行する必要があります。ファイル名とエクスポート名を変更するだけで、ロジックはそのまま動作します。

```ts
// src/proxy.ts
import { updateSession } from "~/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

### Next.js 16 + Serwist (`@serwist/next`)

`next.config.ts` で `withSerwistInit` を使用します。Turbopack がデフォルトですが `next build` は webpack を使用するため互換性の問題はありません。

```ts
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {};

export default withSerwist(nextConfig);
```

### Drizzle ORM + Supabase + `prepare: false`

Supabase の Transaction mode (デフォルト) では `prepare: false` が引き続き必要です。

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle({ client });
```

### Panda CSS + Park UI + Next.js 16

1. `@pandacss/dev` を PostCSS プラグインとして使用 (ゼロランタイムのため RSC 互換)
2. `@park-ui/cli` で生成した recipe を `panda.config.ts` に登録
3. `styled-system/` を `.gitignore` に追加
4. `"prepare": "panda codegen"` を `package.json` に追加

### Playwright + Supabase ローカル + Next.js 16

Playwright の `webServer` 設定で `wait` オプションを活用できます。

```ts
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "pnpm build && pnpm start",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
});
```
