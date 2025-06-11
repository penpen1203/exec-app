# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code)へのガイダンスを提供します。
応答はすべて日本語で行ってください。

## プロジェクト概要

**ExecOS**は、"やるべきこと"実行支援オールインワンWeb/PWAアプリケーションです。目標管理、タスク自動チャンク化、習慣トラッカー、ジャーナル、ガミフィケーションを統合し、ユーザーの実行力向上を支援します。

### MVP (v1.0) スコープ
1. **目標管理** - スマートな目標設定とOKR管理
2. **タスク管理** - LLMによる自動チャンク化とスケジューリング
3. **習慣トラッカー** - ストリークとリマインダー機能
4. **ジャーナル** - LLM要約とリフレーミング
5. **基本ガミフィケーション** - EXP、レベル、バッジシステム
6. **ホーム** - 統合ダッシュボード

### ドキュメント構成
- `docs/ExecOS_spec_v1.0.md` - 要件定義・詳細設計書
- `docs/ExecOS_v1.0_ImplementationPlan.md` - 8週間の実装計画
- `docs/Week1_DetailedPlan.md` - Week1の詳細実装計画

## 開発コマンド

- `pnpm dev` - Turbopackを使用して開発サーバーを起動 (Next.js 15+)
- `pnpm build` - 本番用にアプリケーションをビルド
- `pnpm start` - 本番サーバーを起動
- `pnpm lint` - コード品質チェックのためESLintを実行

このプロジェクトは、存在するロックファイルに基づいてpnpmをパッケージマネージャーとして使用しています。

## アーキテクチャ

これはApp Routerアーキテクチャを使用したNext.js 15アプリケーションです：

- **TypeScript**: パスマッピング（`@/*` → `./src/*`）でStrictモードが有効
- **Tailwind CSS v4**: PostCSS統合を持つモダンなCSSフレームワーク
- **App Router**: `src/app/`内にlayout.tsxとpage.tsx構造でページを配置
- **Geist Fonts**: next/font/google経由でsansとmonoの両バリアントを読み込み
- **React 19**: 並行機能を持つ最新のReactバージョン

プロジェクトはNext.js App Routerの規約に従います：
- `src/app/layout.tsx`のルートレイアウトがグローバルなHTML構造とフォント読み込みを処理
- ページはルートディレクトリ内の`page.tsx`ファイルとして定義
- グローバルスタイルは`src/app/globals.css`に配置

## 主要な設定

- ESLintはNext.jsのcore web vitalsとTypeScriptルールを拡張
- TypeScriptはStrictモードでES2017ターゲットに設定
- Next.js設定はデフォルト設定で最小限
- TDD（テスト駆動開発）を採用

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **UI**: React 19 + TypeScript
- **スタイリング**: Tailwind CSS v4
- **状態管理**: TanStack Query + Zustand
- **フォーム**: React Hook Form + Zod
- **UI コンポーネント**: Radix UI / shadcn/ui

### バックエンド
- **API**: tRPC over Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite) + Drizzle ORM
- **認証**: NextAuth.js v5 (Google/Microsoft OAuth2)
- **セッション**: JWT (24h) + Refresh Token (30d)

### AI/LLM
- **プロバイダー**: OpenAI (GPT-4o, GPT-3.5-Turbo)
- **ローカルLLM**: Llama 3 via Ollama (オプション)
- **使用制限**: 無料版 20k tokens/月, Pro版 200k tokens/月

### インフラ
- **ホスティング**: Cloudflare Pages + Workers
- **CDN**: Cloudflare
- **監視**: Sentry (エラー), Grafana Cloud (メトリクス)
- **CI/CD**: GitHub Actions

## 開発環境セットアップ

### 必要な環境変数 (.env.local)
```
# 認証
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# データベース
DATABASE_URL=

# AI/LLM
OPENAI_API_KEY=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
```

### Cloudflare設定
- `wrangler.toml` - Workers設定ファイル
- D1データベースの作成とマイグレーション
- KVネームスペース（キャッシュ用）

## 開発ガイドライン

### コード規約
- **TypeScript**: Strict modeを維持、型安全性を最優先
- **命名規則**: 
  - コンポーネント: PascalCase
  - 関数・変数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - ファイル: kebab-case
- **コンポーネント設計**: 関数コンポーネント + hooks
- **エラーハンドリング**: 全てのAPI呼び出しでエラー処理必須

### テスト戦略
- **単体テスト**: Vitest (ブランチカバレッジ 80%以上)
- **統合テスト**: Testing Library
- **E2Eテスト**: Playwright
- **パフォーマンステスト**: k6 (p95 < 500ms)

### コミット規約
Conventional Commitsに従う:
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コード整形
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・補助ツール変更
```

### ブランチ戦略
- `main` - プロダクション環境
- `develop` - 開発環境
- `feature/*` - 新機能開発
- `fix/*` - バグ修正
- `hotfix/*` - 緊急修正

### 品質基準
- TypeScriptエラー: 0件
- ESLintエラー: 0件
- Lighthouse スコア: 90点以上
- ビルド時間: 3分以内
- バンドルサイズ: 初期ロード 200KB以下

## プロジェクト固有の仕様

### データベーススキーマ
主要テーブル:
- `users` - ユーザー情報、認証データ
- `goals` - 目標とOKR、canonical_actions
- `tasks` - タスク、サブタスク、依存関係
- `habits` - 習慣、頻度、ストリーク
- `journal_entries` - ジャーナルエントリー
- `gamification` - EXP、レベル、バッジ、実績

### セキュリティ要件
- OAuth2/OIDC認証 (Google, Microsoft)
- JWT Cookie設定: HTTPOnly, Secure, SameSite=Lax
- Content Security Policy (CSP) 設定必須
- データ暗号化: AES-256 (保存時)
- API レート制限: 100 req/min per user

### パフォーマンス要件
- 初期表示: 3秒以内 (3G接続)
- API レスポンス: p95 < 500ms
- オフライン対応: Service Worker実装
- キャッシュ戦略: 
  - 静的アセット: 1年
  - API レスポンス: 5分 (ユーザーデータ)
  - LLM レスポンス: 24時間

### LLM統合仕様
- タスクチャンク化: 最大10サブタスク生成
- ジャーナル要約: 200文字以内
- プロンプトテンプレート管理
- トークン使用量追跡とアラート
- フォールバック: GPT-4o → GPT-3.5-Turbo

### PWA要件
- マニフェスト設定（アイコン、テーマカラー）
- Service Worker実装（オフラインキャッシュ）
- プッシュ通知（習慣リマインダー）
- インストール促進UI
- モバイルファーストデザイン

### 監視・運用
- エラー監視: Sentry integration
- パフォーマンス監視: Web Vitals
- ログ収集: Cloudflare Workers Trace
- アラート設定:
  - エラー率 > 1%
  - API遅延 > 1秒
  - LLMトークン使用率 > 80%

### デプロイメント
- Preview環境: PR毎に自動生成
- Staging環境: develop ブランチ
- Production環境: main ブランチ
- ロールバック: 1クリックで前バージョンへ