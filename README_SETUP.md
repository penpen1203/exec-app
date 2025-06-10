# ExecOS 開発環境セットアップ

## 前提条件
- Node.js 18以上
- pnpm
- Cloudflare アカウント
- Google Cloud Console アカウント（OAuth用）

## セットアップ手順

### 1. 環境変数の設定
```bash
cp .env.local.example .env.local
```

`.env.local`を編集して以下を設定：

#### Google OAuth設定
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
4. アプリケーションの種類：「ウェブアプリケーション」
5. 承認済みのリダイレクトURI：`http://localhost:3000/api/auth/callback/google`
6. 作成されたクライアントIDとシークレットを`.env.local`に設定

#### NextAuth設定
```bash
# NextAuth シークレットを生成
openssl rand -base64 32
```
生成された値を`NEXTAUTH_SECRET`に設定

### 2. 依存関係のインストール
```bash
pnpm install
```

### 3. データベースのセットアップ（ローカル開発用）
```bash
# SQLiteマイグレーションファイルを生成
pnpm db:generate

# ローカルDBファイルを作成（開発用）
mkdir -p .wrangler/state
touch .wrangler/state/d1/DB.sqlite3
```

### 4. 開発サーバーの起動
```bash
pnpm dev
```

## 動作確認

### 1. ホームページ
- http://localhost:3000 にアクセス
- 「ExecOS」のランディングページが表示されることを確認
- 「今すぐ始める」ボタンをクリック

### 2. 認証フロー
- `/auth/signin`ページに遷移することを確認
- 「Googleでサインイン」ボタンが表示される
- ボタンをクリックしてGoogleアカウントでログイン
- 成功すると`/dashboard`にリダイレクトされる

### 3. ダッシュボード
- ログイン後、ダッシュボードが表示される
- ユーザー名が表示される
- 目標、タスク、習慣、レベルの各カードが表示される

### 4. 認証保護の確認
- ログアウト状態で http://localhost:3000/dashboard にアクセス
- `/auth/signin`にリダイレクトされることを確認

## トラブルシューティング

### Google OAuth エラー
- リダイレクトURIが正しく設定されているか確認
- Google Cloud Consoleで「OAuth 2.0 クライアント ID」の設定を確認

### データベースエラー
- `.wrangler/state/d1/`ディレクトリが存在することを確認
- `pnpm db:generate`を再実行

### 環境変数エラー
- `.env.local`ファイルが存在し、必要な値がすべて設定されているか確認
- 開発サーバーを再起動（Ctrl+C → `pnpm dev`）

## 次のステップ
- Cloudflare D1データベースの本番環境セットアップ
- Microsoft OAuth の追加
- 各機能ページの実装