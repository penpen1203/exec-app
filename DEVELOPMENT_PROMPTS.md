# 開発時プロンプト一覧

このファイルは、ExecOS Week1基盤実装時に使用したプロンプトの記録です。

## 初期セットアップ

### 1. ドキュメント日本語化
```
claude.mdを日本語化してください
```

### 2. ドキュメント最新化
```
claude.mdを最新化してください
```

### 3. コミット作業
```
これまでの内容をコミットしてください
```

## Week1実装開始

### 4. ブランチ作成と実装開始
```
ブランチを切ってWeek1の実装を進めてください
```

## セットアップ支援

### 5. 動作確認方法の説明
```
動作確認の方法を教えて下さい
```

### 6. Google OAuth設定支援
画像を添付して以下の質問：
```
OAuthクライアント作成時に添付のような案内が出ましたが、どのように進めればよいでしょうか
```

### 7. Drizzle Kit エラー対応
```
pnpm db:generate実行時に下記の案内が出ました
> exec-os@0.1.0 db:generate /Users/hamadayousuke/Desktop/product/exec-os
> drizzle-kit generate:sqlite

This command is deprecated, please use updated 'generate' command (see https://orm.drizzle.team/kit-docs/upgrade-21#how-to-migrate-to-0210)
```

### 8. 最終確認とコミット
```
確認できました。追加した内容もコミットしておいてください
```

### 9. PR作成
```
これまでの内容でPRを作成してください
```

### 10. プロンプト記録
```
今回のブランチに開発時のプロンプトの一覧をファイルにして含めてください
```

## 実装パターン分析

### 効果的だったプロンプト
1. **具体的な指示**: 「ブランチを切ってWeek1の実装を進めてください」
2. **エラー情報の共有**: 実際のエラー出力を貼り付けて質問
3. **段階的な進行**: 小さなステップに分けて実装を依頼

### 改善点
1. **技術選択の事前確認**: 使用する技術スタックの詳細確認
2. **テスト要件の明確化**: どの程度のテストが必要かの事前確認
3. **セキュリティ要件の確認**: 認証周りのセキュリティ設定の詳細確認

## Week1で実装された機能

### 技術スタック
- Next.js 15 + TypeScript (App Router)
- NextAuth.js v5 (Google OAuth)
- Drizzle ORM + Cloudflare D1
- TanStack Query + Zustand
- React Hook Form + Zod
- Tailwind CSS v4

### データベーススキーマ
- users (ユーザー情報・認証)
- goals (目標・OKR)
- tasks (タスク管理)
- habits (習慣トラッカー)
- journal_entries (ジャーナル)
- gamification (レベル・バッジ)

### 基本UI
- ホームページ (/)
- サインインページ (/auth/signin)
- ダッシュボード (/dashboard)

### 開発環境
- Cloudflare Workers設定
- 環境変数管理
- セットアップドキュメント

## 学習ポイント

1. **monorepo構造**: 初期実装では見送り、シンプルなNext.jsアプリから開始
2. **認証実装**: NextAuth.js v5の最新形式で実装
3. **データベース設計**: Drizzle ORMの最新版に対応
4. **開発体験**: セットアップドキュメントの重要性
5. **段階的実装**: 大きな機能を小さなステップに分解

## 次回への改善案

1. **事前計画の詳細化**: 各Week開始前により詳細な技術仕様を確認
2. **テスト戦略**: 実装と並行してテストコードも作成
3. **型安全性**: より厳密なTypeScript設定
4. **パフォーマンス**: 初期段階からパフォーマンス最適化を考慮
5. **アクセシビリティ**: 基本的なa11y対応を実装段階で組み込み