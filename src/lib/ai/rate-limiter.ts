import { RATE_LIMITS } from './client';

// レート制限トラッカー
class RateLimiter {
  private userRequests = new Map<string, number[]>();

  // ユーザーのリクエスト履歴をクリーンアップ
  private cleanupUserRequests(userId: string): void {
    const now = Date.now();
    const oneMinuteAgo = now - (60 * 1000);
    
    const requests = this.userRequests.get(userId) || [];
    const validRequests = requests.filter(timestamp => timestamp > oneMinuteAgo);
    
    if (validRequests.length === 0) {
      this.userRequests.delete(userId);
    } else {
      this.userRequests.set(userId, validRequests);
    }
  }

  // レート制限チェック
  checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
    this.cleanupUserRequests(userId);
    
    const requests = this.userRequests.get(userId) || [];
    
    if (requests.length >= RATE_LIMITS.REQUESTS_PER_MINUTE) {
      // 最も古いリクエストから1分後まで待機
      const oldestRequest = Math.min(...requests);
      const retryAfter = Math.ceil((oldestRequest + (60 * 1000) - Date.now()) / 1000);
      
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
    }

    return { allowed: true };
  }

  // リクエスト記録
  recordRequest(userId: string): void {
    const now = Date.now();
    const requests = this.userRequests.get(userId) || [];
    requests.push(now);
    this.userRequests.set(userId, requests);
  }

  // ユーザーの現在のリクエスト数取得
  getUserRequestCount(userId: string): number {
    this.cleanupUserRequests(userId);
    return this.userRequests.get(userId)?.length || 0;
  }

  // 統計情報取得
  getStats(): { totalUsers: number; totalRequests: number } {
    let totalRequests = 0;
    for (const requests of this.userRequests.values()) {
      totalRequests += requests.length;
    }

    return {
      totalUsers: this.userRequests.size,
      totalRequests,
    };
  }

  // リセット（テスト用）
  reset(): void {
    this.userRequests.clear();
  }
}

export const rateLimiter = new RateLimiter();

// トークン使用量管理（簡易版）
class TokenUsageTracker {
  private userTokens = new Map<string, Map<string, number>>(); // userId -> month -> tokens

  private getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  }

  // 月次トークン使用量記録
  recordTokenUsage(userId: string, tokens: number): void {
    const month = this.getCurrentMonth();
    
    if (!this.userTokens.has(userId)) {
      this.userTokens.set(userId, new Map());
    }
    
    const userMonthlyTokens = this.userTokens.get(userId)!;
    const currentUsage = userMonthlyTokens.get(month) || 0;
    userMonthlyTokens.set(month, currentUsage + tokens);
  }

  // 月次トークン使用量取得
  getMonthlyUsage(userId: string): number {
    const month = this.getCurrentMonth();
    return this.userTokens.get(userId)?.get(month) || 0;
  }

  // トークン制限チェック（仮実装）
  checkTokenLimit(userId: string, model: string, requestedTokens: number): boolean {
    const monthlyUsage = this.getMonthlyUsage(userId);
    
    // TODO: ユーザープランに応じた制限チェック
    // 現在は仮の制限値
    const limit = model.includes('gpt-4') ? 20000 : 50000;
    
    return (monthlyUsage + requestedTokens) <= limit;
  }

  // 統計情報取得
  getStats(): { totalUsers: number; currentMonth: string } {
    return {
      totalUsers: this.userTokens.size,
      currentMonth: this.getCurrentMonth(),
    };
  }

  // リセット（テスト用）
  reset(): void {
    this.userTokens.clear();
  }
}

export const tokenUsageTracker = new TokenUsageTracker();