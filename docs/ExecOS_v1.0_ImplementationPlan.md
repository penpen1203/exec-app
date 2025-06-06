
# ExecOS v1.0 実装計画（MVP コア機能）
<!-- Generated 2025-06-06 -->

## 対象範囲
Must に分類した以下 6 機能を **8 週間** で「動くプロダクト」として完成させる。  

- 目標・OKR CRUD + LLM リライト  
- タスク登録 → 自動チャンク化 + Google Calendar 反映  
- 習慣トラッカー (Streak)  
- ジャーナル記録 → LLM 要約 & ポジティブリフレーム  
- Gamification (EXP / バッジ / レベル)  
- OAuth ログイン（Google / Microsoft）

---

## 1. 全体ロードマップ（8 Weeks）

| 週 | マイルストーン | 主な Deliverables |
|---|---|---|
| 0 | 環境セットアップ | monorepo / lint / test / CI 雛形 |
| 1 | Auth + 基本 CRUD | `/auth/*` フロー, `/goals` CRUD, JWT Cookie |
| 2 | LLM リライト PoC | OpenAI / Llama3 Adapter + KV Cache |
| 3 | タスクチャンク化 v1 | `/tasks` 5–30 分チャンク & DB 保存 |
| 4 | Google Calendar Sync | OAuth2 Refresh + event insert/update |
| 5 | Habit Tracker + Gamify | `/habits/check`, EXP, バッジ |
| 6 | Journal & Reframe | 夜間 Push → GPT-4o 要約/リフレーム |
| 7 | Frontend Polishing / PWA | ダッシュボード, オフラインキャッシュ |
| 8 | 統合テスト & β公開 | Playwright 全ケース + Cloudflare Pages |

---

## 2. Backlog（Epic → Story）

| Epic | User Story (INVEST) | Story Point |
|------|--------------------|-------------|
| Goal 管理 | 目標登録で LLM が成果物＋期限＋行動を返す | 8 |
| Task チャンク | タスク登録で自動チャンク化 & カレンダー登録 | 13 |
| Habit Tracker | 習慣カード「Done」で streak 更新 | 5 |
| Journal | 22:00 通知 → 日記 → 要約 & 提案 | 8 |
| Gamify | タスク/習慣完了で EXP / バッジ | 3 |
| Auth | Google Sign‑in & 自動ログイン | 5 |
| Calendar Sync | チャンク更新が即カレンダー反映 | 8 |

> **Done 定義**: E2E テスト通過・Lighthouse 90↑・エラーゼロ

---

## 3. アーキテクチャ実装メモ

| レイヤ | 技術 / ライブラリ | To‑do |
|--------|------------------|-------|
| UI | Next.js 14, Tailwind, TanStack Query | Skeleton & DarkMode |
| State | Zustand + React Context | Hydration on PWA |
| API | tRPC (Cloudflare Workers) | zod schema 共有 |
| DB | D1 (SQLite) + Drizzle | Migra & Seed |
| LLM | OpenAI SDK, Ollama | Adapter + Edge KV Cache |
| Auth | Lucia OAuth (Google / MS) | JWT 24h, Refresh 30d |
| Calendar | googleapis Node SDK | Incremental sync |
| Testing | Vitest, Playwright, k6 | CI matrix |
| CI/CD | GitHub Actions → CF Pages / Workers | Blue‑Green & Preview |

---

## 4. クリティカルパス

1. **tRPC 基盤 (週0‑1)**  
2. **LLM Adapter + Cache (週2)**  
3. **Google Calendar OAuth / Refresh (週3‑4)**  
4. **PWA オフライン対応 (週6‑7)**  

---

## 5. リスクと軽減策

| リスク | 影響 | 軽減策 |
|-------|------|-------|
| GPT‑4o 料金超過 | コスト上限突破 | v1.0 ではチャンク化を Llama3 のみに固定 |
| Calendar レート制限 | Sync 遅延 | Batch API + Incremental Token |
| Edge KV 遅延 | キャッシュ Miss | DB フォールバック + BG Repopulate |
| OAuth 仕様変更 | ログイン不能 | Provider 固定 & Regression テスト |

---

## 6. Week‑by‑Week タスク

### Week‑1
- `pnpm create next-app ExecOS`
- Drizzle + D1 ドライバー設定
- OAuth `/auth/*` & JWT Cookie
- Playwright Smoke テスト

### Week‑2
- `POST /goals` + zod schema
- OpenAI / Llama3 Adapter 実装
- KV Cache (24h TTL)
- Goal Editor Modal

### Week‑3
- `POST /tasks` + schema validation
- Llama3 チャンク化アルゴリズム
- Task Board UI (D&D)

### Week‑4
- Google Calendar OAuth & Refresh
- Event insert / update
- Durable‑Objects 失敗キュー

### Week‑5
- `/habits/:id/check` + UTC streak 判定
- Gamify EXP / Badge
- Habit Tracker Card UI

### Week‑6
- CRON 22:00 Push → Journal Modal
- GPT‑4o 要約 & リフレーム
- Journal List / Detail

### Week‑7
- Lighthouse 調整 (≥90)
- PWA Install Prompt
- Offline Cache Strategies

### Week‑8
- Playwright 全ケース + k6 p95
- Blue‑Green 切替 & β URL 公開
- Post‑mortem & v1.1 要件精査

---

_End of v1.0 Implementation Plan_
