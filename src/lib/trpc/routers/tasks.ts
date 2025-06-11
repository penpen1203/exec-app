import { z } from 'zod';
import { router, loggedProtectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { aiAdapter } from '@/lib/ai';
import { nanoid } from 'nanoid';

// タスクのスキーマ定義
const createTaskSchema = z.object({
  goalId: z.string().optional(),
  parentTaskId: z.string().optional(),
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimatedMinutes: z.number().min(5).max(480).optional(), // 5分〜8時間
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string(),
  actualMinutes: z.number().min(0).optional(),
  completedAt: z.date().optional(),
});

const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

// タスクのチャンク化リクエストスキーマ
const chunkTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  estimatedHours: z.number().min(0.5).max(40).optional(), // 30分〜40時間
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const tasksRouter = router({
  // タスク一覧取得
  list: loggedProtectedProcedure
    .input(
      z.object({
        goalId: z.string().optional(),
        status: taskStatusSchema.optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // モックデータを返す（DB実装前）
      const mockTasks = [
        {
          id: 'task-1',
          userId: ctx.session.user.id,
          goalId: input.goalId || null,
          parentTaskId: null,
          title: 'TypeScriptの基本文法を学習',
          description: '公式ドキュメントとハンズオンチュートリアルを完了する',
          status: 'in_progress' as const,
          priority: 'high' as const,
          estimatedMinutes: 120,
          actualMinutes: 60,
          dueDate: new Date('2024-12-15'),
          completedAt: null,
          dependencies: [],
          tags: ['学習', 'TypeScript'],
          aiGenerated: true,
          aiPrompt: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-10'),
        },
        {
          id: 'task-2',
          userId: ctx.session.user.id,
          goalId: input.goalId || null,
          parentTaskId: null,
          title: 'Genericsの理解と実装',
          description: 'ジェネリック型の概念を理解し、実践的なコードを書く',
          status: 'pending' as const,
          priority: 'medium' as const,
          estimatedMinutes: 180,
          actualMinutes: null,
          dueDate: new Date('2024-12-20'),
          completedAt: null,
          dependencies: ['task-1'],
          tags: ['学習', 'TypeScript', '応用'],
          aiGenerated: true,
          aiPrompt: null,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-05'),
        },
      ];

      // フィルタリング
      let filteredTasks = mockTasks;
      
      if (input.status) {
        filteredTasks = filteredTasks.filter(task => task.status === input.status);
      }
      
      if (input.priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === input.priority);
      }

      // ページネーション
      const paginatedTasks = filteredTasks.slice(input.offset, input.offset + input.limit);
      const nextOffset = input.offset + input.limit;

      return {
        tasks: paginatedTasks,
        hasMore: nextOffset < filteredTasks.length,
        total: filteredTasks.length,
      };
    }),

  // タスク作成
  create: loggedProtectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const taskId = `task-${nanoid()}`;

      // モックデータとして新しいタスクを返す
      const newTask = {
        id: taskId,
        userId,
        goalId: input.goalId || null,
        parentTaskId: input.parentTaskId || null,
        title: input.title,
        description: input.description || null,
        status: input.status,
        priority: input.priority,
        estimatedMinutes: input.estimatedMinutes || null,
        actualMinutes: null,
        dueDate: input.dueDate || null,
        completedAt: null,
        dependencies: [],
        tags: input.tags || [],
        aiGenerated: false,
        aiPrompt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Note: Mock implementation - data is not persisted
      return newTask;
    }),

  // タスク更新
  update: loggedProtectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;
      
      // ステータスが完了に変更された場合、completedAtを設定
      if (updateData.status === 'completed' && !updateData.completedAt) {
        updateData.completedAt = new Date();
      }

      // モック実装
      return {
        id,
        ...updateData,
        updatedAt: new Date(),
      };
    }),

  // タスクのAIチャンク化
  chunk: loggedProtectedProcedure
    .input(chunkTaskSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // AIアダプターを使用してタスクをチャンク化
        const chunkRequest = {
          userId: ctx.session.user.id,
          title: input.title,
          description: input.description,
          priority: input.priority === 'urgent' ? 'high' : input.priority,
          deadline: input.estimatedHours 
            ? new Date(Date.now() + input.estimatedHours * 60 * 60 * 1000).toISOString()
            : undefined,
        };

        const result = await aiAdapter.chunkGoal(chunkRequest);

        if ('error' in result) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: result.error,
          });
        }

        // チャンク化されたタスクをタスク形式に変換
        const chunkedTasks = result.chunks.map((chunk) => ({
          id: `task-chunk-${nanoid()}`,
          userId: ctx.session.user.id,
          title: chunk.title,
          description: chunk.description,
          status: 'pending' as const,
          priority: input.priority,
          estimatedMinutes: Math.round(chunk.estimatedHours * 60),
          order: chunk.order,
          dependencies: chunk.dependencies.map(depIndex => 
            result.chunks[depIndex] ? `dep-${depIndex}` : null
          ).filter(Boolean) as string[],
          aiGenerated: true,
          aiPrompt: input.title,
        }));

        return {
          tasks: chunkedTasks,
          totalEstimatedMinutes: Math.round(result.totalEstimatedHours * 60),
          reasoning: result.reasoning,
        };

      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'タスクのチャンク化に失敗しました',
        });
      }
    }),

  // タスクステータス更新
  updateStatus: loggedProtectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: taskStatusSchema,
      })
    )
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = {
        status: input.status,
        updatedAt: new Date(),
      };

      // ステータスが完了の場合
      if (input.status === 'completed') {
        updateData.completedAt = new Date();
      }

      // モック実装
      return {
        id: input.id,
        ...updateData,
      };
    }),

  // タスクの統計情報
  stats: loggedProtectedProcedure
    .input(
      z.object({
        goalId: z.string().optional(),
      })
    )
    .query(async () => {
      // モック統計データ
      return {
        total: 10,
        pending: 5,
        inProgress: 3,
        completed: 2,
        cancelled: 0,
        totalEstimatedMinutes: 1200,
        totalActualMinutes: 480,
        completionRate: 0.2,
        averageCompletionTime: 240, // 分単位
      };
    }),
});