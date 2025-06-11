'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Loader2, X, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TaskCreateFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  goalId?: string;
}

export function TaskCreateForm({ onCancel, onSuccess, goalId }: TaskCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [isChunking, setIsChunking] = useState(false);

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success('タスクを作成しました');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const chunkTask = trpc.tasks.chunk.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.tasks.length}個のサブタスクを生成しました`);
      setIsChunking(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsChunking(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    const estimatedMinutes = estimatedHours ? parseFloat(estimatedHours) * 60 : undefined;

    createTask.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      estimatedMinutes,
      goalId,
    });
  };

  const handleAIChunk = () => {
    if (!title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    setIsChunking(true);
    chunkTask.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      priority,
    });
  };

  const isSubmitting = createTask.isPending || isChunking;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm w-full max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">新しいタスク</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            タイトル *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: プレゼン資料の作成"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
            maxLength={200}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="タスクの詳細や手順を記入してください"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
            maxLength={1000}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
              優先度
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">緊急</option>
            </select>
          </div>

          <div>
            <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
              見積もり時間（時間）
            </label>
            <input
              id="estimatedHours"
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="例: 2.5"
              min="0.1"
              max="8"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleAIChunk}
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 border border-purple-300 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChunking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AIでサブタスクに分割
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isSubmitting}
          >
            キャンセル
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTask.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            作成
          </button>
        </div>
      </form>

      {/* AI分割の説明 */}
      <div className="mt-4 p-3 bg-purple-50 rounded-md">
        <p className="text-xs text-purple-700">
          <strong>AIでサブタスクに分割:</strong> 大きなタスクを効率的な小さなサブタスクに自動分割します。
          各サブタスクは1〜8時間で完了できる単位になります。
        </p>
      </div>
    </div>
  );
}