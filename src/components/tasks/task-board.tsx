'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { TaskColumn } from './task-column';
import { TaskCreateForm } from './task-create-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedMinutes?: number | null;
  dueDate?: string | number | Date | null;
  tags?: string[];
}

const statusColumns: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'pending', title: '未着手', color: 'bg-gray-100' },
  { status: 'in_progress', title: '進行中', color: 'bg-blue-50' },
  { status: 'completed', title: '完了', color: 'bg-green-50' },
];

export function TaskBoard() {
  const [isCreating, setIsCreating] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // タスク一覧取得
  const { data, isLoading, refetch } = trpc.tasks.list.useQuery({
    limit: 100,
  });

  // タスクステータス更新
  const updateStatus = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'ステータスの更新に失敗しました');
    },
  });

  // ドラッグ開始
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  // ドロップ処理
  const handleDrop = (status: TaskStatus) => {
    if (!updateStatus.isPending && draggedTask && draggedTask.status !== status) {
      updateStatus.mutate({
        id: draggedTask.id,
        status,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const tasks = data?.tasks || [];

  // ステータスごとにタスクをグループ化
  const tasksByStatus = statusColumns.reduce((acc, column) => {
    acc[column.status] = tasks.filter(task => task.status === column.status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="space-y-6">
      {/* 新規タスク作成ボタン */}
      <div className="flex justify-end">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            新しいタスク
          </button>
        ) : (
          <TaskCreateForm
            onCancel={() => setIsCreating(false)}
            onSuccess={() => {
              setIsCreating(false);
              refetch();
            }}
          />
        )}
      </div>

      {/* タスクボード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={tasksByStatus[column.status]}
            color={column.color}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            isDragging={draggedTask !== null}
          />
        ))}
      </div>

      {/* 統計情報 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">統計情報</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">総タスク数:</span>
            <span className="ml-2 font-medium">{tasks.length}</span>
          </div>
          <div>
            <span className="text-gray-500">未着手:</span>
            <span className="ml-2 font-medium">{tasksByStatus.pending.length}</span>
          </div>
          <div>
            <span className="text-gray-500">進行中:</span>
            <span className="ml-2 font-medium">{tasksByStatus.in_progress.length}</span>
          </div>
          <div>
            <span className="text-gray-500">完了:</span>
            <span className="ml-2 font-medium">{tasksByStatus.completed.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}