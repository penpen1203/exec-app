import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Target, CheckSquare, Repeat, Trophy } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ダッシュボード
        </h1>
        <p className="mt-2 text-gray-600">
          ようこそ、{session.user.name || session.user.email}さん
        </p>
        
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/goals" className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">目標</h2>
                <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
                <p className="text-sm text-gray-500">アクティブな目標</p>
              </div>
              <Target className="h-8 w-8 text-blue-600 opacity-75" />
            </div>
          </Link>
          
          <div className="rounded-lg bg-white p-6 shadow opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">タスク</h2>
                <p className="mt-2 text-3xl font-bold text-green-600">0</p>
                <p className="text-sm text-gray-500">今日のタスク</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600 opacity-75" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Week3で実装予定</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">習慣</h2>
                <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
                <p className="text-sm text-gray-500">継続日数</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-600 opacity-75" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Week5で実装予定</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">レベル</h2>
                <p className="mt-2 text-3xl font-bold text-orange-600">1</p>
                <p className="text-sm text-gray-500">0 / 100 EXP</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-600 opacity-75" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Week4で実装予定</p>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Week2 実装完了機能</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              目標管理とAIチャンク化機能
            </li>
            <li className="text-blue-600">
              目標を作成して、AIが自動的に実行可能なタスクに分割します
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}