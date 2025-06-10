import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { goals } from './goals';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  parentTaskId: text('parent_task_id'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('pending'), // pending, in_progress, completed, cancelled
  priority: text('priority').default('medium'), // low, medium, high, urgent
  estimatedMinutes: integer('estimated_minutes'),
  actualMinutes: integer('actual_minutes'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  dependencies: text('dependencies', { mode: 'json' }), // JSON array of task IDs
  tags: text('tags', { mode: 'json' }), // JSON array of tags
  aiGenerated: integer('ai_generated', { mode: 'boolean' }).default(false),
  aiPrompt: text('ai_prompt'), // Original prompt used for AI generation
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});