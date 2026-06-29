/**
 * Schema + seed routine for the PostgreSQL driver.
 *
 * Applies `db/schema.sql` (idempotent) and inserts the sample dataset if the
 * jobs table is empty. Only invoked from `server.ts` when DB_DRIVER=postgres.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { query } from '../db'
import { SqlJobRepository } from './job.repository'
import { seedJobs } from './job.seed-data'

export async function ensureSchemaAndSeed(): Promise<void> {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql')
  const schema = await readFile(schemaPath, 'utf8')
  await query(schema)

  const { rows } = await query<{ count: string }>('SELECT COUNT(*)::int AS count FROM jobs')
  if (Number(rows[0]?.count ?? 0) > 0) return

  const repo = new SqlJobRepository()
  for (const job of seedJobs) {
    await repo.create(job)
  }
  console.log(`Seeded ${seedJobs.length} jobs`)
}
