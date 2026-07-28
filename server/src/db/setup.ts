/**
 * Apply `schema.sql` to the configured database.
 *
 * Run with: `npm run db:setup -w @job-posting/server`
 *
 * This is a create-from-scratch script, not a migration tool. `schema.sql` uses
 * bare `CREATE TABLE`, so re-running it against a populated database fails —
 * which is the safe default. Pass `--force` to drop the tables it owns first,
 * which is what you want after a schema change like the `job_postings` rewrite.
 *
 * `--force` destroys data. It refuses to run when NODE_ENV=production.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'
import { env } from '../config/env'

/**
 * Dropped in dependency order — children before the tables they reference.
 *
 * `jobs` is a legacy table an earlier version of the seed routine created; it
 * is listed so a reset clears it rather than leaving an orphan behind.
 */
const OWNED_TABLES = [
  'application_tracker',
  'saved_jobs',
  'faq',
  'job_postings',
  'jobs',
  'user_preferences',
  'users',
]

async function main(): Promise<void> {
  const force = process.argv.includes('--force')

  if (!env.databaseUrl) {
    console.error('DATABASE_URL is not set. Point it at your Postgres instance and retry.')
    process.exit(1)
  }
  if (force && env.isProduction) {
    console.error('Refusing to run --force with NODE_ENV=production.')
    process.exit(1)
  }

  // `__dirname` rather than `import.meta.url`: the server compiles to CommonJS.
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')

  const client = new Client({ connectionString: env.databaseUrl, connectionTimeoutMillis: 10_000 })
  await client.connect()

  try {
    const { rows } = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [OWNED_TABLES],
    )

    if (rows.length > 0 && !force) {
      console.error(
        `These tables already exist: ${rows.map((r) => r.table_name).join(', ')}.\n` +
          'Re-run with --force to drop and recreate them. This deletes their data.',
      )
      process.exit(1)
    }

    // One transaction: a partially applied schema is worse than none.
    await client.query('BEGIN')
    if (force && rows.length > 0) {
      console.log(`Dropping ${rows.length} existing table(s)...`)
      await client.query(`DROP TABLE IF EXISTS ${OWNED_TABLES.join(', ')} CASCADE`)
    }
    await client.query(schema)
    await client.query('COMMIT')

    const { rows: created } = await client.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = ANY($1)`,
      [OWNED_TABLES],
    )
    console.log(`Schema applied. ${created[0].count} table(s) present.`)
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('Schema setup failed:', error instanceof Error ? error.message : error)
  process.exit(1)
})
