'use client';

import { Clock, Tag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedMinutes?: number | null;
  dueDate?: Date | null;
  tags?: string[];
}

interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const priorityConfig = {
  low: { label: '低', color: 'text-gray-600 bg-gray-100' },
  medium: { label: '中', color: 'text-blue-600 bg-blue-100' },
  high: { label: '高', color: 'text-orange-600 bg-orange-100' },
  urgent: { label: '緊急', color: 'text-red-600 bg-red-100' },
};

export function TaskCard({ task, onDragStart, onDragEnd }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 flex-1 pr-2">{task.title}</h4>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}
        >
          {priority.label}
        </span>
      </div>

      {/* 説明 */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* メタ情報 */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        {/* 見積もり時間 */}
        {task.estimatedMinutes && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{Math.floor(task.estimatedMinutes / 60)}時間{task.estimatedMinutes % 60}分</span>
          </div>
        )}

        {/* 期限 */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
            {isOverdue && <AlertCircle className="h-3 w-3" />}
            <span>
              {format(new Date(task.dueDate), 'M/d', { locale: ja })}
            </span>
          </div>
        )}
      </div>

      {/* タグ */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}