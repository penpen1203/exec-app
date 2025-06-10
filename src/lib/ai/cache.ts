import { createHash } from 'crypto';
import type { CacheEntry, AIResponse } from './types';
import { CACHE_CONFIG } from './client';

// Cloudflare KV namespace type definition
interface KVNamespace {
  get(key: string, type?: 'text' | 'json'): Promise<unknown>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// キャッシュキー生成
export function generateCacheKey(prompt: string, model: string, temperature: number): string {
  const input = `${prompt}:${model}:${temperature}`;
  return createHash('sha256').update(input).digest('hex');
}

// メモリキャッシュ（開発環境用）
class MemoryCache {
  private cache = new Map<string, CacheEntry>();

  async get(key: string): Promise<CacheEntry | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // 有効期限チェック
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  async set(key: string, response: AIResponse): Promise<void> {
    const now = Date.now();
    const expiresAt = now + (CACHE_CONFIG.TTL_HOURS * 60 * 60 * 1000);

    const entry: CacheEntry = {
      key,
      response: { ...response, cached: true },
      createdAt: now,
      expiresAt,
    };

    // キャッシュサイズ制限
    if (this.cache.size >= CACHE_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
    };
  }
}

// KVキャッシュ（本番環境用）
class KVCache {
  private kv: KVNamespace | null = null;

  constructor() {
    // Cloudflare Workers環境でのみKVを使用
    if (typeof globalThis !== 'undefined' && 'AI_CACHE' in globalThis) {
      this.kv = (globalThis as unknown as { AI_CACHE: KVNamespace }).AI_CACHE;
    }
  }

  async get(key: string): Promise<CacheEntry | null> {
    if (!this.kv) return null;

    try {
      const cached = await this.kv.get(key, 'json');
      if (!cached) return null;

      const entry = cached as CacheEntry;
      
      // 有効期限チェック
      if (Date.now() > entry.expiresAt) {
        await this.kv.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      console.error('KV cache get error:', error);
      return null;
    }
  }

  async set(key: string, response: AIResponse): Promise<void> {
    if (!this.kv) return;

    const now = Date.now();
    const expiresAt = now + (CACHE_CONFIG.TTL_HOURS * 60 * 60 * 1000);

    const entry: CacheEntry = {
      key,
      response: { ...response, cached: true },
      createdAt: now,
      expiresAt,
    };

    try {
      // TTLを設定してKVに保存
      await this.kv.put(key, JSON.stringify(entry), {
        expirationTtl: CACHE_CONFIG.TTL_HOURS * 60 * 60,
      });
    } catch (error) {
      console.error('KV cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.kv) return;

    try {
      await this.kv.delete(key);
    } catch (error) {
      console.error('KV cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    // KVの一括削除は実装が複雑なため、個別削除を想定
    console.warn('KV cache clear is not implemented');
  }
}

// 環境に応じたキャッシュインスタンス
export const aiCache = process.env.NODE_ENV === 'production' 
  ? new KVCache() 
  : new MemoryCache();

// キャッシュユーティリティ関数
export async function getCachedResponse(
  prompt: string, 
  model: string, 
  temperature: number
): Promise<AIResponse | null> {
  const cacheKey = generateCacheKey(prompt, model, temperature);
  const cached = await aiCache.get(cacheKey);
  return cached?.response || null;
}

export async function setCachedResponse(
  prompt: string, 
  model: string, 
  temperature: number, 
  response: AIResponse
): Promise<void> {
  const cacheKey = generateCacheKey(prompt, model, temperature);
  await aiCache.set(cacheKey, response);
}