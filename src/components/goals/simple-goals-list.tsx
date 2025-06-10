'use client';

import { trpc } from '@/lib/trpc/client';
import { SimpleGoalForm } from './simple-goal-form';
import { Target, Calendar, Flag, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

const statusConfig = {
  active: { label: 'アクティブ', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  completed: { label: '完了', color: 'text-green-600 bg-green-50 border-green-200' },
  paused: { label: '一時停止', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  archived: { label: 'アーカイブ', color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

export function SimpleGoalsList() {
  // 目標一覧取得
  const {
    data: goalsData,
    isLoading,
  } = trpc.goals.list.useQuery({
    status: 'active',
    limit: 50,
  });

  // 統計情報取得
  const { data: stats } = trpc.goals.stats.useQuery();

  const goals = goalsData?.goals || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6" />
            目標管理
          </h2>
          {stats && (
            <p className="text-sm text-gray-600 mt-1">
              アクティブ: {stats.totalActive}件 | 完了: {stats.totalCompleted}件
            </p>
          )}
        </div>

        <SimpleGoalForm />
      </div>

      {/* 目標一覧 */}
      {goals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">目標がありません</h3>
          <p className="text-gray-600 mb-6">
            新しい目標を作成して、やりたいことを整理しましょう
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                    {goal.title}
                  </h3>
                  
                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    {/* ステータス */}
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
                      statusConfig[goal.status as GoalStatus]?.color || statusConfig.active.color
                    }`}>
                      <Flag className="h-3 w-3" />
                      {statusConfig[goal.status as GoalStatus]?.label || 'アクティブ'}
                    </span>

                    {/* 進捗 */}
                    {typeof goal.progress === 'number' && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        進捗: {goal.progress}%
                      </span>
                    )}

                    {/* 締切日 */}
                    {goal.targetDate && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(goal.targetDate), 'yyyy/MM/dd', { locale: ja })}
                      </span>
                    )}

                    {/* チャンク化済み */}
                    {Array.isArray(goal.canonicalActions) && goal.canonicalActions.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-full">
                        AI分析済み ({goal.canonicalActions.length})
                      </span>
                    )}
                  </div>

                  {/* チャンク化されたアクション */}
                  {Array.isArray(goal.canonicalActions) && goal.canonicalActions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-gray-700">推奨アクション:</p>
                      <ul className="space-y-1">
                        {goal.canonicalActions.slice(0, 3).map((action, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0" />
                            {typeof action === 'string' ? action : 'アクション'}
                          </li>
                        ))}
                        {goal.canonicalActions.length > 3 && (
                          <li className="text-xs text-gray-500">
                            ...他 {goal.canonicalActions.length - 3} 件
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Week2実装完了の説明 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Week2 実装完了機能</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            基本的な目標管理機能（作成・一覧表示）
          </li>
          <li className="text-blue-600">
            AIチャンク化機能はWeek3で実装予定です
          </li>
        </ul>
      </div>
    </div>
  );
}