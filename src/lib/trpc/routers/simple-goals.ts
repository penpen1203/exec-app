import { z } from 'zod';
import { router, loggedProtectedProcedure } from '../trpc';

// 簡易版の目標ルーター（DBなしでも動作）
export const simpleGoalsRouter = router({
  // 目標一覧取得（モックデータ）
  list: loggedProtectedProcedure
    .input(
      z.object({
        status: z.enum(['active', 'completed', 'paused', 'archived']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // 開発環境用のモックデータ
      const mockGoals = [
        {
          id: 'goal-1',
          userId: ctx.session.user.id,
          title: 'TypeScript完全習得',
          description: 'プロジェクトでTypeScriptを使いこなせるようになる',
          category: 'professional',
          status: 'active',
          progress: 30,
          targetDate: new Date('2024-12-31'),
          parentGoalId: null,
          canonicalActions: ['基本文法の学習', 'Genericsの理解', '実践プロジェクト作成'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'goal-2',
          userId: ctx.session.user.id,
          title: '毎日30分の読書習慣',
          description: '知識の幅を広げるため毎日読書する',
          category: 'personal',
          status: 'active',
          progress: 60,
          targetDate: null,
          parentGoalId: null,
          canonicalActions: ['読書時間の確保', '読書リストの作成', '読書記録の習慣化'],
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-20'),
        },
      ];

      // フィルタリング
      const filteredGoals = input.status 
        ? mockGoals.filter(goal => goal.status === input.status)
        : mockGoals;

      const paginatedGoals = filteredGoals.slice(input.offset, input.offset + input.limit);

      return {
        goals: paginatedGoals,
        hasMore: paginatedGoals.length === input.limit,
      };
    }),

  // 目標作成（モック）
  create: loggedProtectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
        description: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(['active', 'completed', 'paused', 'archived']).default('active'),
        progress: z.number().min(0).max(100).default(0),
        targetDate: z.date().optional(),
        parentGoalId: z.string().optional(),
        canonicalActions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // モックデータとして新しい目標を返す
      const newGoal = {
        id: `goal-${Date.now()}`,
        userId,
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 実際にはデータベースに保存されません
      console.log('Created goal (mock):', newGoal);

      return newGoal;
    }),

  // 統計情報（モック）
  stats: loggedProtectedProcedure.query(async () => {
    return {
      totalActive: 2,
      totalCompleted: 0,
      categoryBreakdown: {
        personal: 1,
        professional: 1,
        health: 0,
        other: 0,
      },
    };
  }),

  // AIチャンク化（モック）
  chunk: loggedProtectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        deadline: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // モックのチャンク化結果
      const mockChunks = [
        {
          title: '基礎調査と計画立案',
          description: '目標達成のための詳細な調査と計画を作成する',
          estimatedHours: 4,
          order: 0,
          dependencies: [],
        },
        {
          title: '環境構築と準備',
          description: '必要なツールやリソースを準備する',
          estimatedHours: 2,
          order: 1,
          dependencies: [0],
        },
        {
          title: '実行段階1',
          description: '計画の第1フェーズを実行する',
          estimatedHours: 8,
          order: 2,
          dependencies: [1],
        },
      ];

      return {
        goal: { id: input.id, canonicalActions: mockChunks.map(c => c.title) },
        chunks: mockChunks,
        totalEstimatedHours: 14,
        reasoning: 'この目標を効率的に達成するため、調査→準備→実行の段階的なアプローチを推奨します。',
      };
    }),
});