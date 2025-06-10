import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';

/**
 * tRPC コンテキストの作成
 * リクエストごとに実行され、プロシージャで使用できるデータを提供
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts;

  // セッション情報を取得
  const session = await auth();

  // D1データベースはCloudflare Workers環境でのみ利用可能
  // 開発環境では仮のDBオブジェクトを使用
  const db = process.env.NODE_ENV === 'production' && 'DB' in globalThis
    ? getDb((globalThis as unknown as { DB: import('@cloudflare/workers-types').D1Database }).DB)
    : null;

  return {
    session,
    db,
    req,
    res,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;