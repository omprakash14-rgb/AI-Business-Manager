import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import { env } from '../config/env.js';

let dbInstance: PostgresJsDatabase<typeof schema> | null = null;
let sqlClient: ReturnType<typeof postgres> | null = null;

/**
 * Returns the Drizzle ORM instance connected to Supabase PostgreSQL.
 *
 * Connection Strategy:
 * - Uses `postgres` driver (postgres.js) configured with `prepare: false`.
 * - Setting `prepare: false` is required when connecting via Supabase's
 *   transaction connection pooler (Supavisor / PgBouncer, port 6543)
 *   because prepared statements are not supported in transaction mode.
 * - For direct connections or local development, it functions seamlessly.
 * - When DATABASE_URL is not set, returns null to allow fallback to in-memory store.
 */
export function getDb(): PostgresJsDatabase<typeof schema> | null {
  if (dbInstance) return dbInstance;
  if (!env.DATABASE_URL) return null;

  try {
    sqlClient = postgres(env.DATABASE_URL, {
      prepare: false, // Critical for Supabase connection pooler (port 6543)
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10
    });

    dbInstance = drizzle(sqlClient, { schema });
    return dbInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase PostgreSQL connection:', error);
    return null;
  }
}

export const db = getDb();
