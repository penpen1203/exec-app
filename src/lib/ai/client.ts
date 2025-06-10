import OpenAI from 'openai';
import { createOpenAI } from '@ai-sdk/openai';

// OpenAI クライアント設定
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI SDK クライアント設定
export const aiOpenAI = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 使用可能なモデル定義
export const AI_MODELS = {
  GPT_4O: 'gpt-4o',
  GPT_35_TURBO: 'gpt-3.5-turbo',
  GPT_4O_MINI: 'gpt-4o-mini',
} as const;

export type AIModel = typeof AI_MODELS[keyof typeof AI_MODELS];

// トークン制限定義
export const TOKEN_LIMITS = {
  FREE_MONTHLY: {
    [AI_MODELS.GPT_4O]: 20000,
    [AI_MODELS.GPT_35_TURBO]: 50000,
    [AI_MODELS.GPT_4O_MINI]: 100000,
  },
  PRO_MONTHLY: {
    [AI_MODELS.GPT_4O]: 200000,
    [AI_MODELS.GPT_35_TURBO]: 300000,
    [AI_MODELS.GPT_4O_MINI]: 500000,
  },
} as const;

// レート制限定義
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 30,
  MAX_RETRIES: 2,
} as const;

// キャッシュ設定
export const CACHE_CONFIG = {
  TTL_HOURS: 24,
  MAX_CACHE_SIZE: 1000, // キャッシュエントリーの最大数
} as const;