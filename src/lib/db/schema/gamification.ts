import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const userStats = sqliteTable('user_stats', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  level: integer('level').default(1),
  experience: integer('experience').default(0),
  nextLevelExp: integer('next_level_exp').default(100),
  totalTasksCompleted: integer('total_tasks_completed').default(0),
  totalGoalsCompleted: integer('total_goals_completed').default(0),
  totalHabitDays: integer('total_habit_days').default(0),
  totalJournalEntries: integer('total_journal_entries').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

export const badges = sqliteTable('badges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  category: text('category').notNull(), // task, goal, habit, journal, special
  requirement: text('requirement', { mode: 'json' }).notNull(), // JSON object with conditions
  experienceReward: integer('experience_reward').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

export const userBadges = sqliteTable('user_badges', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeId: text('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  earnedAt: integer('earned_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});