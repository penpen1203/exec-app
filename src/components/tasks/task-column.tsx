'use client';

import { TaskCard } from './task-card';

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

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDrop: (status: TaskStatus) => void;
  isDragging: boolean;
}

export function TaskColumn({
  title,
  status,
  tasks,
  color,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
}: TaskColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-opacity-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-opacity-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-opacity-50');
    onDrop(status);
  };

  return (
    <div
      className={`${color} rounded-lg p-4 min-h-[400px] transition-colors ${
        isDragging ? 'border-2 border-dashed border-gray-300' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="font-medium text-gray-900 mb-4">
        {title} ({tasks.length})
      </h3>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={() => onDragStart(task)}
            onDragEnd={onDragEnd}
          />
        ))}
        
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            タスクがありません
          </p>
        )}
      </div>
    </div>
  );
}