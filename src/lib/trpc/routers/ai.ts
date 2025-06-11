import { z } from 'zod';
import { router, loggedProtectedProcedure, publicProcedure } from '../trpc';
import { aiAdapter } from '@/lib/ai';
import { AIRequestSchema } from '@/lib/ai/types';

export const aiRouter = router({
  // 基本的なテキスト生成
  generate: loggedProtectedProcedure
    .input(AIRequestSchema.omit({ userId: true }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const result = await aiAdapter.generateText({
        ...input,
        userId,
      });

      if ('error' in result) {
        throw new Error(result.error);
      }

      return result;
    }),

  // AI サービスの健康チェック
  healthCheck: publicProcedure
    .query(async () => {
      return await aiAdapter.healthCheck();
    }),

  // AI 使用統計
  stats: loggedProtectedProcedure
    .query(async () => {
      return aiAdapter.getStats();
    }),

  // プロンプトテンプレート一覧
  templates: publicProcedure
    .query(() => {
      return {
        goalChunk: {
          name: '目標チャンク化',
          description: '大きな目標を実行可能なタスクに分割します',
          category: 'productivity',
          template: '目標「{title}」を具体的なタスクに分割してください。',
        },
        taskSummary: {
          name: 'タスク要約',
          description: 'タスクの内容を簡潔に要約します',
          category: 'productivity',
          template: 'このタスクを50文字以内で要約してください: {description}',
        },
        habitMotivation: {
          name: '習慣モチベーション',
          description: '習慣継続のための励ましメッセージを生成します',
          category: 'wellness',
          template: '習慣「{habitName}」を{streak}日継続中です。励ましのメッセージをください。',
        },
        journalReflection: {
          name: 'ジャーナル振り返り',
          description: '日記の内容から気づきや学びを抽出します',
          category: 'wellness',
          template: 'この日記から学びや気づきを3つ教えてください: {content}',
        },
      };
    }),

  // カスタムプロンプト実行
  customPrompt: loggedProtectedProcedure
    .input(
      z.object({
        template: z.string().min(1, 'テンプレートは必須です'),
        variables: z.record(z.string()),
        model: z.enum(['gpt-4o', 'gpt-3.5-turbo', 'gpt-4o-mini']).default('gpt-3.5-turbo'),
        maxTokens: z.number().min(1).max(2000).default(500),
        temperature: z.number().min(0).max(2).default(0.7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // テンプレート変数を置換
      let prompt = input.template;
      for (const [key, value] of Object.entries(input.variables)) {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
      }

      const result = await aiAdapter.generateText({
        prompt,
        model: input.model,
        maxTokens: input.maxTokens,
        temperature: input.temperature,
        userId,
      });

      if ('error' in result) {
        throw new Error(result.error);
      }

      return {
        ...result,
        originalTemplate: input.template,
        resolvedPrompt: prompt,
        variables: input.variables,
      };
    }),

  // モデル選択アドバイス
  recommendModel: publicProcedure
    .input(
      z.object({
        taskType: z.enum(['creative', 'analytical', 'conversational', 'factual']),
        complexity: z.enum(['simple', 'medium', 'complex']),
        maxBudget: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const { taskType, complexity, maxBudget } = input;

      const recommendations = {
        creative: {
          simple: 'gpt-4o-mini',
          medium: 'gpt-3.5-turbo',
          complex: 'gpt-4o',
        },
        analytical: {
          simple: 'gpt-3.5-turbo',
          medium: 'gpt-4o',
          complex: 'gpt-4o',
        },
        conversational: {
          simple: 'gpt-4o-mini',
          medium: 'gpt-3.5-turbo',
          complex: 'gpt-3.5-turbo',
        },
        factual: {
          simple: 'gpt-4o-mini',
          medium: 'gpt-4o-mini',
          complex: 'gpt-3.5-turbo',
        },
      };

      const baseRecommendation = recommendations[taskType][complexity];
      
      // 予算制約がある場合の調整
      if (maxBudget && maxBudget < 0.01) {
        return {
          model: 'gpt-4o-mini',
          reasoning: '予算制約のため、最もコストパフォーマンスの良いモデルを推奨します',
          alternatives: [baseRecommendation],
        };
      }

      return {
        model: baseRecommendation,
        reasoning: `${taskType}タスクで${complexity}レベルの複雑さに最適化されたモデルです`,
        alternatives: Object.values(recommendations[taskType]).filter(m => m !== baseRecommendation),
      };
    }),
});