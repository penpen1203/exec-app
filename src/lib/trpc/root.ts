import { router } from './trpc';
import { simpleGoalsRouter } from './routers/simple-goals';
import { aiRouter } from './routers/ai';

/**
 * メインのtRPCルーター
 * 全てのサブルーターをここで統合
 */
export const appRouter = router({
  goals: simpleGoalsRouter,
  ai: aiRouter,
});

// ルーターの型を export
export type AppRouter = typeof appRouter;