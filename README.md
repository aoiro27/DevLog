# DevLog

毎日少しずつ、技術の学びを残すためのマイクロアウトプットアプリです。

「完璧な勉強メモ」ではなく、**今日触ったこと・詰まったこと・分かったことを短く書く**ことを目的にしています。連続日数とカレンダーで「続くこと」を可視化します。

## できること

- メール／パスワードでのログイン（**新規登録はアプリから不可・一人用**）
- 今日の学びを **Markdown** で投稿（画像のペースト／ドロップ対応）
- タイトル・タグ付きで記録
- タイトル / 本文 / タグでの検索・タグ絞り込み
- 連続日数・最長・累計日数
- 今月の記録ヒートマップ
- 日付ごとの履歴

## 技術構成

| 層 | 技術 |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend | Supabase（Auth / Postgres / Storage / RLS） |
| 日付基準 | Asia/Tokyo |

> Supabase は Auth・DB・画像 Storage のデプロイ先です。フロントエンドは Vercel などへデプロイし、Supabase に接続する構成を想定しています。

## セットアップ

### 1. Supabase プロジェクト

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. **SQL Editor** で次を順番に実行
   - `supabase/migrations/20260719000000_init.sql`
   - `supabase/migrations/20260719000001_markdown_storage.sql`
   - `supabase/migrations/20260719000002_search.sql`
3. **Project Settings → API** から URL と `anon` key を控える
4. **Authentication → Users → Add user** で自分のアカウントだけ作る（メール＋パスワード）
5. **Authentication → Providers → Email** で **Enable sign ups をオフ**にする（公開登録を禁止）
6. Confirm email は個人利用ならオフでOK

### 2. アプリ

```bash
cp .env.local.example .env.local
# .env.local に SUPABASE の URL / anon key を入れる

npm install
npm run dev
```

http://localhost:3000 を開きます。

### 3. Auth リダイレクト（本番）

Supabase の **Authentication → URL Configuration** に、本番のサイト URL を追加してください。

## デプロイ

### Supabase（DB / Auth）

- マイグレーション SQL を本番プロジェクトで実行
- Auth のサイト URL / Redirect URLs を設定

CLI を使う場合:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### フロントエンド（例: Vercel）

1. リポジトリを Vercel にインポート
2. Environment Variables に以下を設定
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. デプロイ

## 使い方のコツ

- 1 行でも OK。続くことの方が価値が高い
- トピックは `React` / `SQL` など短く
- 連続が途切れても、また 1 日から再開すればいい

## ディレクトリ

```
src/app/(app)/today   今日の投稿
src/app/(app)/log     履歴
src/app/login         認証
src/lib/supabase     Supabase クライアント
supabase/migrations   DB スキーマ
```
