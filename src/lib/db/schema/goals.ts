import { sqliteTable, text, integer, real, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'), // personal, professional, health, etc.
  status: text('status').default('active'), // active, completed, paused, archived
  progress: real('progress').default(0), // 0-100
  targetDate: integer('target_date', { mode: 'timestamp' }),
  parentGoalId: text('parent_goal_id'),
  canonicalActions: text('canonical_actions', { mode: 'json' }), // JSON array of canonical actions
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
}, (table) => ({
  progressCheck: check('progress_range', sql`${table.progress} >= 0 AND ${table.progress} <= 100`)
}));

export const keyResults = sqliteTable('key_results', {
  id: text('id').primaryKey(),
  goalId: text('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  targetValue: real('target_value').notNull(),
  currentValue: real('current_value').default(0),
  unit: text('unit'), // percentage, count, currency, etc.
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});