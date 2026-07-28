/**
 * Schema drift detection.
 *
 * `schema.sql` creates tables with `IF NOT EXISTS`, which is what makes it safe
 * to re-run — but it also means an *older, incompatible* table is silently left
 * in place. When that happens the app starts cleanly and then fails on every
 * request with something like `column "posting_date" does not exist`, which
 * points at the query rather than at the real problem.
 *
 * This check runs at startup and names the drift instead.
 */

import { query } from '.'

/** Columns the SQL repositories depend on, by table. */
const REQUIRED_COLUMNS: Record<string, string[]> = {
  job_postings: [
    'job_id',
    'employer_name',
    'position',
    'job_type',
    'job_location',
    'posting_date',
    'application_link',
    'source_id',
    'active',
  ],
  users: ['user_id', 'email', 'password_hash', 'google_id', 'role', 'created_at'],
  user_preferences: ['id', 'theme', 'updated_at'],
}

export class SchemaDriftError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SchemaDriftError'
  }
}

/**
 * Verify the live database matches what the repositories expect.
 *
 * Throws `SchemaDriftError` listing the missing columns per table. Only tables
 * that already exist are checked — a table that is simply absent will be
 * created by `schema.sql`.
 */
export async function verifySchema(): Promise<void> {
  const { rows } = await query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY($1)`,
    [Object.keys(REQUIRED_COLUMNS)],
  )

  const actual = new Map<string, Set<string>>()
  for (const row of rows) {
    const set = actual.get(row.table_name) ?? new Set<string>()
    set.add(row.column_name)
    actual.set(row.table_name, set)
  }

  const problems: string[] = []
  for (const [table, required] of Object.entries(REQUIRED_COLUMNS)) {
    const present = actual.get(table)
    if (!present) continue // Not created yet; schema.sql handles it.

    const missing = required.filter((column) => !present.has(column))
    if (missing.length > 0) {
      problems.push(`  - ${table} is missing: ${missing.join(', ')}`)
    }
  }

  if (problems.length === 0) return

  throw new SchemaDriftError(
    'The database does not match the current schema:\n' +
      problems.join('\n') +
      '\n\nThese tables predate the current schema.sql. Because tables are created ' +
      'with IF NOT EXISTS, an outdated table is left untouched rather than upgraded.\n' +
      'Either add `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` statements to ' +
      'schema.sql, or drop the outdated tables and let them be recreated and reseeded.',
  )
}
