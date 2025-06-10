import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import superjson from 'superjson';

// tRPC インスタンスの初期化
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: null,
      },
    };
  },
});

// ルーターとプロシージャのエクスポート
export const router = t.router;
export const publicProcedure = t.procedure;

// 認証が必要なプロシージャ
export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user?.id) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return next({
      ctx: {
        ...ctx,
        session: {
          ...ctx.session,
          user: ctx.session.user,
        },
      },
    });
  })
);

// ミドルウェア: リクエストログ
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  console.log(`${type} ${path} - ${durationMs}ms`);

  return result;
});

// ログ付きプロシージャ
export const loggedProcedure = publicProcedure.use(loggerMiddleware);
export const loggedProtectedProcedure = protectedProcedure.use(loggerMiddleware);