import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';

export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  content: text('content').notNull(),
  mood: text('mood'), // great, good, okay, bad, terrible
  tags: text('tags', { mode: 'json' }), // JSON array of tags
  aiSummary: text('ai_summary'), // AI-generated summary
  aiInsights: text('ai_insights', { mode: 'json' }), // AI-generated insights/reframes
  aiProcessedAt: integer('ai_processed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});