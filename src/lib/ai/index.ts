// AI ライブラリのメインエクスポート
export { aiAdapter, AIAdapter } from './adapter';
export { aiCache, getCachedResponse, setCachedResponse, generateCacheKey } from './cache';
export { rateLimiter, tokenUsageTracker } from './rate-limiter';
export { openai, aiOpenAI, AI_MODELS, TOKEN_LIMITS, RATE_LIMITS, CACHE_CONFIG } from './client';

// 型定義のエクスポート
export type {
  AIRequest,
  AIResponse,
  AIError,
  CacheEntry,
  TokenUsage,
  GoalChunkRequest,
  GoalChunkResponse,
} from './types';

// スキーマのエクスポート
export {
  AIRequestSchema,
  AIResponseSchema,
  AIErrorSchema,
  CacheEntrySchema,
  TokenUsageSchema,
  GoalChunkRequestSchema,
  GoalChunkResponseSchema,
} from './types';

// ユーティリティ関数
export const aiUtils = {
  // プロンプトのトークン数概算
  estimateTokens: (text: string): number => {
    return Math.ceil(text.length / 4);
  },

  // モデル選択ヘルパー
  selectModel: (complexity: 'simple' | 'medium' | 'complex'): string => {
    switch (complexity) {
      case 'simple':
        return 'gpt-4o-mini';
      case 'medium':
        return 'gpt-3.5-turbo';
      case 'complex':
        return 'gpt-4o';
      default:
        return 'gpt-3.5-turbo';
    }
  },

  // レスポンス時間の分類
  categorizeResponseTime: (ms: number): 'fast' | 'normal' | 'slow' => {
    if (ms < 1000) return 'fast';
    if (ms < 5000) return 'normal';
    return 'slow';
  },

  // エラーメッセージの日本語化
  formatErrorMessage: (error: { code: string; error: string; retryAfter?: number }): string => {
    switch (error.code) {
      case 'RATE_LIMIT':
        return `利用制限に達しました。${error.retryAfter}秒後に再試行してください。`;
      case 'TOKEN_LIMIT':
        return '月次トークン制限に達しました。プランの見直しをご検討ください。';
      case 'INVALID_REQUEST':
        return 'リクエストの形式が正しくありません。';
      case 'API_ERROR':
        return 'AI サービスでエラーが発生しました。しばらく待ってから再試行してください。';
      case 'CACHE_ERROR':
        return 'キャッシュの処理でエラーが発生しました。';
      default:
        return error.error;
    }
  },
} as const;