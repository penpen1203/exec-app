# ExecOS CI/CD セットアップガイド

## 概要

ExecOSのCI/CDパイプラインは以下の構成で動作します：

- **CI**: GitHub Actions
- **ホスティング**: Cloudflare Pages
- **データベース**: Cloudflare D1
- **認証**: NextAuth.js (Google/Microsoft OAuth2)

## 必要な設定

### 1. GitHub Secrets

以下のシークレットをGitHubリポジトリの Settings > Secrets and variables > Actions で設定してください：

```
CLOUDFLARE_API_TOKEN      # CloudflareのAPIトークン
CLOUDFLARE_ACCOUNT_ID     # CloudflareアカウントID
GOOGLE_CLIENT_ID          # Google OAuth2クライアントID
GOOGLE_CLIENT_SECRET      # Google OAuth2クライアントシークレット
MICROSOFT_CLIENT_ID       # Microsoft OAuth2クライアントID
MICROSOFT_CLIENT_SECRET   # Microsoft OAuth2クライアントシークレット
NEXTAUTH_SECRET          # NextAuth.jsのシークレット
OPENAI_API_KEY           # OpenAI APIキー
```

### 2. Cloudflare設定

#### D1データベースの作成
```bash
# wranglerのインストール
npm install -g wrangler

# Cloudflareにログイン
wrangler login

# D1データベースの作成
wrangler d1 create exec-os-db

# データベースIDを wrangler.toml に設定
```

#### KVネームスペースの作成
```bash
# 本番用KV
wrangler kv:namespace create "CACHE"

# プレビュー用KV
wrangler kv:namespace create "CACHE" --preview
```

#### Pages設定
```bash
# Cloudflare Pagesプロジェクトの作成
wrangler pages project create exec-os

# 環境変数の設定
wrangler pages secret put NEXTAUTH_SECRET
wrangler pages secret put GOOGLE_CLIENT_ID
wrangler pages secret put GOOGLE_CLIENT_SECRET
wrangler pages secret put MICROSOFT_CLIENT_ID
wrangler pages secret put MICROSOFT_CLIENT_SECRET
wrangler pages secret put OPENAI_API_KEY
```

### 3. OAuth2設定

#### Google OAuth2
1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクト作成
2. OAuth2認証情報を作成
3. 認証されたリダイレクトURIを設定：
   - `http://localhost:3000/api/auth/callback/google` (開発用)
   - `https://exec-os.pages.dev/api/auth/callback/google` (本番用)

#### Microsoft OAuth2
1. [Azure Portal](https://portal.azure.com/)でアプリ登録
2. 認証を設定
3. リダイレクトURIを設定：
   - `http://localhost:3000/api/auth/callback/azure-ad` (開発用)
   - `https://exec-os.pages.dev/api/auth/callback/azure-ad` (本番用)

## CI/CDパイプライン

### ワークフロー概要

1. **test**: TypeScript、ESLint、ビルド、E2Eテスト
2. **security**: セキュリティ監査
3. **deploy-preview**: PRごとのプレビューデプロイ
4. **deploy-production**: mainブランチへの本番デプロイ
5. **performance**: Lighthouseパフォーマンステスト

### 品質基準

- TypeScriptエラー: 0件
- ESLintエラー: 0件
- E2Eテスト: 100%パス
- Lighthouseスコア: 
  - Performance: 85点以上
  - Accessibility: 90点以上
  - Best Practices: 85点以上
  - SEO: 90点以上
  - PWA: 80点以上

## 環境

### Preview環境
- URL: `https://[branch-name].exec-os.pages.dev`
- トリガー: Pull Request作成時
- 機能: フル機能（認証含む）

### Production環境
- URL: `https://exec-os.pages.dev`
- トリガー: mainブランチへのpush
- 機能: フル機能（認証含む）

## トラブルシューティング

### よくある問題

1. **ビルドエラー**
   - Next.js設定でstatic exportが有効か確認
   - 環境変数が正しく設定されているか確認

2. **認証エラー**
   - OAuth2のリダイレクトURIが正しく設定されているか確認
   - NEXTAUTH_URLが正しく設定されているか確認

3. **デプロイエラー**
   - Cloudflare API トークンの権限を確認
   - Pages プロジェクト名が正しいか確認

### ログの確認

```bash
# GitHub Actionsログ
# リポジトリの Actions タブで確認

# Cloudflareログ
wrangler pages deployment list exec-os
wrangler pages deployment tail exec-os
```

## セキュリティ

- 全ての秘匿情報はGitHub SecretsまたはCloudflare環境変数で管理
- セキュリティヘッダーを自動設定
- 定期的な脆弱性スキャン実行
- Dependabotによる依存関係の自動更新