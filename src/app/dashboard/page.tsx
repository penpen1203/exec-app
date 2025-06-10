import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

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
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">目標</h2>
            <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500">アクティブな目標</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">タスク</h2>
            <p className="mt-2 text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500">今日のタスク</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">習慣</h2>
            <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">継続日数</p>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-gray-900">レベル</h2>
            <p className="mt-2 text-3xl font-bold text-orange-600">1</p>
            <p className="text-sm text-gray-500">0 / 100 EXP</p>
          </div>
        </div>
      </div>
    </div>
  );
}