/**
 * SQL database connection component (PostgreSQL).
 *
 * This is the single place that owns the database connection pool. Repositories
 * import `getPool()` (or `query()`) from here to run SQL. Nothing else in the
 * app should create a connection.
 *
 * Used only when DB_DRIVER=postgres. Set DATABASE_URL in your .env (see the
 * README for the full env reference); `server.ts` calls `connectToDatabase()`
 * on startup in that mode.
 */

import { Pool, type QueryResult, type QueryResultRow } from 'pg'
import { env } from '../config/env'

let pool: Pool | null = null

/** Initialise the connection pool. Safe to call once at startup. */
export async function connectToDatabase(): Promise<void> {
  if (pool) return

  // TODO: configure pool options (ssl, max connections, timeouts) as needed.
  pool = new Pool({ connectionString: env.databaseUrl })

  // TODO: optionally verify connectivity here, e.g.
  // await pool.query('SELECT 1')
}

/** Access the active pool. Throws if the DB has not been initialised. */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialised. Call connectToDatabase() first.')
  }
  return pool
}

/** Convenience helper for parameterised queries. */
export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params)
}

/** Close the pool on graceful shutdown. */
export async function closeDatabase(): Promise<void> {
  if (!pool) return
  await pool.end()
  pool = null
}
