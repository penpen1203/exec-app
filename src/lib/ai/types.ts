import { z } from 'zod';

// AI リクエスト基本スキーマ
export const AIRequestSchema = z.object({
  prompt: z.string().min(1, 'プロンプトは必須です'),
  model: z.enum(['gpt-4o', 'gpt-3.5-turbo', 'gpt-4o-mini']),
  maxTokens: z.number().positive().optional().default(500),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  userId: z.string().min(1, 'ユーザーIDは必須です'),
});

export type AIRequest = z.infer<typeof AIRequestSchema>;

// AI レスポンススキーマ
export const AIResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }),
  cached: z.boolean().default(false),
  processingTime: z.number(),
});

export type AIResponse = z.infer<typeof AIResponseSchema>;

// エラーレスポンススキーマ
export const AIErrorSchema = z.object({
  error: z.string(),
  code: z.enum(['RATE_LIMIT', 'TOKEN_LIMIT', 'INVALID_REQUEST', 'API_ERROR', 'CACHE_ERROR']),
  retryAfter: z.number().optional(),
});

export type AIError = z.infer<typeof AIErrorSchema>;

// キャッシュエントリースキーマ
export const CacheEntrySchema = z.object({
  key: z.string(),
  response: AIResponseSchema,
  createdAt: z.number(),
  expiresAt: z.number(),
});

export type CacheEntry = z.infer<typeof CacheEntrySchema>;

// トークン使用量スキーマ
export const TokenUsageSchema = z.object({
  userId: z.string(),
  model: z.string(),
  tokensUsed: z.number(),
  month: z.string(), // YYYY-MM format
  createdAt: z.number(),
});

export type TokenUsage = z.infer<typeof TokenUsageSchema>;

// 目標チャンク化用のスキーマ
export const GoalChunkRequestSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  userId: z.string().min(1, 'ユーザーIDは必須です'),
});

export type GoalChunkRequest = z.infer<typeof GoalChunkRequestSchema>;

export const GoalChunkResponseSchema = z.object({
  chunks: z.array(z.object({
    title: z.string(),
    description: z.string(),
    estimatedHours: z.number(),
    order: z.number(),
    dependencies: z.array(z.number()).default([]),
  })),
  totalEstimatedHours: z.number(),
  reasoning: z.string(),
});

export type GoalChunkResponse = z.infer<typeof GoalChunkResponseSchema>;