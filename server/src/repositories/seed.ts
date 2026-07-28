/**
 * Schema + seed routine for the PostgreSQL driver.
 *
 * Applies `db/schema.sql` (idempotent) and triggers ingestion from local listings.json
 * if the job_postings table is empty. Only invoked from `server.ts` when DB_DRIVER=postgres.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { query } from '../db'
import { verifySchema } from '../db/verifySchema'
import { ingestService } from '../services/ingest.service'

export async function ensureSchemaAndSeed(): Promise<void> {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql')
  const schema = await readFile(schemaPath, 'utf8')
  await query(schema)

  // Applying schema.sql cannot upgrade a pre-existing, outdated table, so
  // confirm the result actually matches what the repositories query.
  await verifySchema()

  const { rows } = await query<{ count: string }>('SELECT COUNT(*)::int AS count FROM job_postings')
  if (Number(rows[0]?.count ?? 0) > 0) return

  const res = await ingestService.ingestFromLocalFile()
  console.log(`Seeded ${res.created} jobs into PostgreSQL from local listings.json`)
}
