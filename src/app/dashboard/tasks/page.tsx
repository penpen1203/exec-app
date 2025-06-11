import { TaskBoard } from '@/components/tasks/task-board';

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">タスク管理</h1>
        <p className="text-gray-600 mt-2">
          タスクの進捗を管理し、効率的に目標を達成しましょう
        </p>
      </div>

      <TaskBoard />
    </div>
  );
}