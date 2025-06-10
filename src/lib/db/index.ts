import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema';

export function getDb(d1: D1Database): ReturnType<typeof drizzle> {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof getDb>;