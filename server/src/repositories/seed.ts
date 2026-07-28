/**
 * Schema + seed routine for the PostgreSQL driver.
 *
 * Runs from `server.ts` on startup when DB_DRIVER=postgres, so a fresh database
 * becomes usable without a manual step.
 *
 * It must never take the API down. `schema.sql` uses bare `CREATE TABLE`, so
 * applying it to a database that already has the tables raises
 * "relation already exists" — and running that unconditionally at boot meant a
 * second startup crashed the server outright, which looks to the client exactly
 * like the API being unreachable. So the schema is applied only when it is
 * genuinely absent, and a failure here is logged rather than thrown: a running
 * API that reports errors per-request beats a process that won't start.
 *
 * For deliberate schema changes use `npm run db:setup -- --force`, which
 * drops and recreates. This routine will not migrate an existing database.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { query } from '../db'
import { SqlJobRepository } from './job.repository'
import { seedJobs } from './job.seed-data'

export async function ensureSchemaAndSeed(): Promise<void> {
  try {
    const { rows } = await query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'job_postings'`,
    )

    if (Number(rows[0]?.count ?? 0) === 0) {
      const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql')
      await query(await readFile(schemaPath, 'utf8'))
      console.log('Applied schema.sql')
    }

    const counted = await query<{ count: number }>(
      'SELECT COUNT(*)::int AS count FROM job_postings',
    )
    if (Number(counted.rows[0]?.count ?? 0) > 0) return

    const repo = new SqlJobRepository()
    for (const job of seedJobs) {
      await repo.create(job)
    }
    console.log(`Seeded ${seedJobs.length} jobs. Run \`npm run ingest\` for real listings.`)
  } catch (error) {
    // Most likely an out-of-date schema. Say so clearly and keep serving.
    console.error(
      'Schema/seed step failed — the API is still running, but job queries will error.\n' +
        'If the schema is out of date, reset it with: npm run db:setup -- --force\n',
      error instanceof Error ? error.message : error,
    )
  }
}
