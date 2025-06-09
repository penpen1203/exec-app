# ExecOS Week1 詳細実装計画

## 概要
- **期間**: 7日間
- **主目標**: 基盤構築とOAuth認証の実装
- **最終成果物**: Google OAuth認証機能付きの基本PWAアプリケーション

---

## Day1: Monorepo構造とDrizzle ORM設定

### タスク詳細
1. **プロジェクト構造最適化**
   - `apps/` ディレクトリ作成（将来のbrowser extension対応）
   - `packages/` ディレクトリ作成（共通ライブラリ）
   - workspace設定（pnpm-workspace.yaml）

2. **Drizzle ORM導入**
   ```bash
   pnpm add drizzle-orm @cloudflare/d1
   pnpm add -D drizzle-kit
   ```

3. **環境設定**
   - `.env.local` テンプレート作成
   - Cloudflare Workers環境設定
   - wrangler.toml 初期設定

### 成果物
- `drizzle.config.ts` 設定完了
- DB接続テスト成功

---

## Day2: D1データベース設計と初期マイグレーション

### タスク詳細
1. **データベーススキーマ定義**
   ```typescript
   // packages/database/schema/
   - users.ts (id, email, name, created_at)
   - goals.ts (id, user_id, title, canonical_actions, due_at)
   - tasks.ts (id, goal_id, title, chunk_index, due_at, status)
   - habits.ts (id, user_id, name, streak, last_done)
   - journal.ts (id, user_id, content, summary, created_at)
   ```

2. **マイグレーション作成**
   ```bash
   drizzle-kit generate:sqlite
   drizzle-kit migrate
   ```

3. **シードデータ作成**
   - 開発用テストデータ投入スクリプト

### 成果物
- 全テーブル作成完了
- マイグレーションスクリプト動作確認

---

## Day3: tRPC API基盤とZodスキーマ設定

### タスク詳細
1. **tRPC セットアップ**
   ```bash
   pnpm add @trpc/server @trpc/client @trpc/next @trpc/react-query
   pnpm add @tanstack/react-query
   pnpm add zod
   ```

2. **API ルーター作成**
   ```typescript
   // apps/web/src/server/api/
   - auth.ts (login, logout, me)
   - goals.ts (CRUD operations)
   - tasks.ts (CRUD + chunk operations)
   - habits.ts (CRUD + check operations)
   ```

3. **Zod バリデーションスキーマ**
   ```typescript
   // packages/schemas/
   - auth.schema.ts
   - goals.schema.ts  
   - tasks.schema.ts
   - habits.schema.ts
   ```

### 成果物
- tRPC クライアント/サーバー接続成功
- 基本CRUD API エンドポイント動作確認

---

## Day4: Google OAuth2認証フロー実装

### タスク詳細
1. **OAuth プロバイダー設定**
   ```bash
   pnpm add @auth/core @auth/drizzle-adapter
   ```

2. **Google Cloud Console設定**
   - OAuth 2.0クライアントID作成
   - リダイレクトURI設定
   - 認証情報取得

3. **認証フロー実装**
   ```typescript
   // apps/web/src/pages/api/auth/
   - [...nextauth].ts
   - callback/google.ts
   ```

4. **環境変数設定**
   ```env
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=
   ```

### 成果物
- Google OAuth ログイン動作確認
- ユーザー情報取得成功

---

## Day5: JWT Cookieとセッション管理

### タスク詳細
1. **JWT実装**
   ```bash
   pnpm add jose
   ```

2. **セッション管理機能**
   ```typescript
   // packages/auth/
   - jwt.ts (token生成/検証)
   - session.ts (セッション管理)
   - middleware.ts (認証チェック)
   ```

3. **Cookie設定**
   - HTTPOnly, Secure, SameSite設定
   - 有効期限設定（JWT: 24h, Refresh: 30d）

4. **認証ミドルウェア**
   - Next.js middleware.ts
   - API保護機能

### 成果物
- 自動ログイン機能動作確認
- セッション永続化成功

---

## Day6: 基本UI（認証画面、ダッシュボード雛形）

### タスク詳細
1. **UI ライブラリ導入**
   ```bash
   pnpm add @headlessui/react @heroicons/react
   pnpm add react-hot-toast
   ```

2. **認証UI作成**
   ```typescript
   // apps/web/src/components/auth/
   - LoginForm.tsx
   - LogoutButton.tsx
   - AuthProvider.tsx
   ```

3. **ダッシュボード雛形**
   ```typescript
   // apps/web/src/components/dashboard/
   - Dashboard.tsx
   - Navigation.tsx
   - UserProfile.tsx
   ```

4. **レスポンシブデザイン**
   - モバイルファースト対応
   - ダークモード切替機能

### 成果物
- ログイン/ログアウト画面完成
- ダッシュボード基本レイアウト完成

---

## Day7: Playwright E2Eテスト環境構築とスモークテスト

### タスク詳細
1. **Playwright セットアップ**
   ```bash
   pnpm add -D @playwright/test
   npx playwright install
   ```

2. **テスト設定**
   ```typescript
   // playwright.config.ts
   - ブラウザ設定 (Chrome, Firefox, Safari)
   - テスト環境設定
   - スクリーンショット設定
   ```

3. **スモークテスト作成**
   ```typescript
   // tests/e2e/
   - auth.spec.ts (ログイン/ログアウト)
   - dashboard.spec.ts (ダッシュボード表示)
   - navigation.spec.ts (画面遷移)
   ```

4. **CI/CD 設定**
   ```yaml
   # .github/workflows/test.yml
   - Playwright実行
   - テスト結果レポート
   ```

### 成果物
- E2Eテスト実行環境完成
- 基本機能テストケース通過確認

---

## Week1 完了判定基準

### 必須項目
- [ ] Google OAuth認証が動作する
- [ ] データベース接続・マイグレーション成功
- [ ] tRPC API が基本動作する
- [ ] 認証状態でダッシュボードにアクセス可能
- [ ] E2Eテストが全て通過する

### 品質基準
- [ ] Lighthouse スコア 80点以上
- [ ] TypeScript エラー 0件
- [ ] ESLint エラー 0件
- [ ] レスポンシブデザイン対応完了

### ドキュメント
- [ ] API仕様書更新
- [ ] 開発環境セットアップ手順書
- [ ] Week2への引き継ぎ事項まとめ

---

## リスク対応

### 高リスク
1. **OAuth設定エラー**
   - 軽減策: Google Cloud Console設定の再確認
   - 代替案: 開発環境では固定ユーザーでの認証

2. **Cloudflare D1接続問題**
   - 軽減策: ローカルSQLiteでの開発継続
   - 代替案: Supabase への一時的な移行

### 中リスク
1. **tRPC設定の複雑さ**
   - 軽減策: 公式ドキュメントに従った最小構成から開始
   - 代替案: REST API での初期実装

---

## 次週への引き継ぎ

### Week2 準備項目
- LLM統合準備（OpenAI API キー設定）
- Llama3 Ollama環境構築検討
- タスクチャンク化アルゴリズムの設計開始

### 技術負債・改善点
- 認証フローのエラーハンドリング強化
- データベースクエリの最適化
- コンポーネントの再利用性向上