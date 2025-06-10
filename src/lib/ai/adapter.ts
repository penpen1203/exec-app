import { generateText } from 'ai';
import { aiOpenAI, AI_MODELS } from './client';
import { rateLimiter, tokenUsageTracker } from './rate-limiter';
import { getCachedResponse, setCachedResponse } from './cache';
import type { AIRequest, AIResponse, AIError, GoalChunkRequest, GoalChunkResponse } from './types';

// AI アダプタークラス
export class AIAdapter {
  // 基本的なテキスト生成
  async generateText(request: AIRequest): Promise<AIResponse | AIError> {
    const startTime = Date.now();

    try {
      // レート制限チェック
      const rateCheck = rateLimiter.checkRateLimit(request.userId);
      if (!rateCheck.allowed) {
        return {
          error: 'レート制限に達しました',
          code: 'RATE_LIMIT',
          retryAfter: rateCheck.retryAfter,
        };
      }

      // トークン制限チェック（概算）
      const estimatedTokens = Math.ceil(request.prompt.length / 4) + (request.maxTokens || 500);
      if (!tokenUsageTracker.checkTokenLimit(request.userId, request.model, estimatedTokens)) {
        return {
          error: '月次トークン制限に達しました',
          code: 'TOKEN_LIMIT',
        };
      }

      // キャッシュチェック
      const cached = await getCachedResponse(
        request.prompt, 
        request.model, 
        request.temperature || 0.7
      );
      
      if (cached) {
        return {
          ...cached,
          processingTime: Date.now() - startTime,
        };
      }

      // AI SDK を使用してテキスト生成
      const result = await generateText({
        model: aiOpenAI(request.model),
        prompt: request.prompt,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
      });

      const response: AIResponse = {
        content: result.text,
        model: request.model,
        usage: {
          promptTokens: result.usage?.promptTokens || 0,
          completionTokens: result.usage?.completionTokens || 0,
          totalTokens: result.usage?.totalTokens || 0,
        },
        cached: false,
        processingTime: Date.now() - startTime,
      };

      // 使用量記録
      rateLimiter.recordRequest(request.userId);
      tokenUsageTracker.recordTokenUsage(request.userId, response.usage.totalTokens);

      // キャッシュに保存
      await setCachedResponse(
        request.prompt, 
        request.model, 
        request.temperature || 0.7, 
        response
      );

      return response;

    } catch (error: unknown) {
      console.error('AI generation error:', error);
      
      return {
        error: error instanceof Error ? error.message : 'AI生成エラーが発生しました',
        code: 'API_ERROR',
      };
    }
  }

  // 目標のチャンク化
  async chunkGoal(request: GoalChunkRequest): Promise<GoalChunkResponse | AIError> {
    const prompt = this.buildGoalChunkPrompt(request);

    const aiRequest: AIRequest = {
      prompt,
      model: AI_MODELS.GPT_4O,
      maxTokens: 1000,
      temperature: 0.3, // より一貫性のある結果のため低めに設定
      userId: request.userId,
    };

    const result = await this.generateText(aiRequest);

    if ('error' in result) {
      return result;
    }

    try {
      // JSONレスポンスをパース
      const parsed = JSON.parse(result.content) as {
        chunks: Array<{
          title?: string;
          description?: string;
          estimatedHours?: number;
          dependencies?: number[];
        }>;
        totalEstimatedHours?: number;
        reasoning?: string;
      };
      
      // バリデーション
      const response: GoalChunkResponse = {
        chunks: parsed.chunks.map((chunk, index: number) => ({
          title: chunk.title || `タスク ${index + 1}`,
          description: chunk.description || '',
          estimatedHours: Math.max(chunk.estimatedHours || 1, 0.5),
          order: index,
          dependencies: chunk.dependencies || [],
        })),
        totalEstimatedHours: parsed.totalEstimatedHours || 0,
        reasoning: parsed.reasoning || '',
      };

      return response;

    } catch (parseError) {
      console.error('Goal chunk parse error:', parseError);
      
      // フォールバック: GPT-3.5-Turboで再試行
      if (aiRequest.model === AI_MODELS.GPT_4O) {
        return this.chunkGoal({ ...request });
      }

      return {
        error: 'チャンク化結果の解析に失敗しました',
        code: 'INVALID_REQUEST',
      };
    }
  }

  // 目標チャンク化プロンプト生成
  private buildGoalChunkPrompt(request: GoalChunkRequest): string {
    return `
あなたは優秀なプロジェクトマネージャーです。以下の目標を効率的に達成するための具体的なタスクに分割してください。

## 目標情報
- タイトル: ${request.title}
- 説明: ${request.description || 'なし'}
- 締切: ${request.deadline || '未設定'}
- 優先度: ${request.priority}

## 要求事項
1. 目標を5-10個の具体的なタスクに分割
2. 各タスクは1-8時間で完了可能な単位にする
3. タスク間の依存関係を明確にする
4. 実行順序を考慮する

## 出力フォーマット（JSON）
\`\`\`json
{
  "chunks": [
    {
      "title": "タスクのタイトル",
      "description": "具体的な作業内容",
      "estimatedHours": 2,
      "dependencies": [0, 1]
    }
  ],
  "totalEstimatedHours": 10,
  "reasoning": "分割の理由と実行戦略"
}
\`\`\`

JSONのみを出力してください。`;
  }

  // 健康チェック
  async healthCheck(): Promise<{ status: 'ok' | 'error'; details: unknown }> {
    try {
      // 簡単なテストリクエスト
      const testRequest: AIRequest = {
        prompt: 'Hello',
        model: AI_MODELS.GPT_4O_MINI,
        maxTokens: 10,
        temperature: 0,
        userId: 'health-check',
      };

      const result = await this.generateText(testRequest);
      
      if ('error' in result) {
        return { status: 'error', details: result };
      }

      return { 
        status: 'ok', 
        details: { 
          model: result.model,
          processingTime: result.processingTime,
          cached: result.cached,
        }
      };

    } catch (error: unknown) {
      return { 
        status: 'error', 
        details: { 
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Error',
        }
      };
    }
  }

  // 統計情報取得
  getStats(): {
    rateLimit: { totalUsers: number; totalRequests: number };
    tokenUsage: { totalUsers: number; currentMonth: string };
  } {
    return {
      rateLimit: rateLimiter.getStats(),
      tokenUsage: tokenUsageTracker.getStats(),
    };
  }
}

// シングルトンインスタンス
export const aiAdapter = new AIAdapter();