export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex max-w-4xl flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
          ExecOS
        </h1>
        <p className="text-xl text-gray-600 sm:text-2xl">
          やるべきことを、確実に実行へ
        </p>
        
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="/auth/signin"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white hover:bg-blue-700"
          >
            今すぐ始める
          </a>
          <a
            href="/about"
            className="rounded-lg border border-gray-300 bg-white px-8 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            詳しく見る
          </a>
        </div>
        
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">目標管理</h3>
            <p className="mt-2 text-gray-600">
              スマートな目標設定とOKRで成長を加速
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">AI タスク分解</h3>
            <p className="mt-2 text-gray-600">
              大きなタスクを実行可能なステップに自動分解
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">習慣トラッカー</h3>
            <p className="mt-2 text-gray-600">
              継続は力なり。習慣化をゲーム感覚でサポート
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
