/**
 * Seed data must fit the schema it is loaded into.
 *
 * `listings.json` is ingested on the first postgres boot. A value wider than
 * its column fails with Postgres 22001 ("value too long") *during startup*,
 * which previously surfaced only as an unreachable API — two multi-city
 * postings joined to 691 characters against a VARCHAR(200) column.
 *
 * This compares the real seed data against the widths declared in schema.sql,
 * so the mismatch is caught here rather than on someone's first `docker up`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { RawListing } from './services/ingest.service'

const schema = readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8')
const listings = JSON.parse(
  readFileSync(path.join(__dirname, 'data', 'listings.json'), 'utf8'),
) as RawListing[]

/** Declared width of a `job_postings` column, or null when it is unbounded. */
function declaredWidth(column: string): number | null {
  const body = /CREATE TABLE IF NOT EXISTS job_postings \(([\s\S]*?)\n\);/i.exec(schema)?.[1]
  if (!body) throw new Error('Could not locate the job_postings definition in schema.sql')

  const match = new RegExp(`^\\s*${column}\\s+(\\w+)(?:\\((\\d+)\\))?`, 'im').exec(body)
  if (!match) throw new Error(`Column "${column}" not found in job_postings`)

  return match[2] ? Number(match[2]) : null
}

/** Mirrors the mapping in ingest.service.ts. */
function mapped(raw: RawListing) {
  return {
    employer_name: raw.company_name,
    position: raw.title,
    job_location: raw.locations?.length ? raw.locations.join('; ') : 'Remote',
    application_link: raw.url,
    source_id: raw.id,
    source_repo: raw.source ?? 'github',
  }
}

const usable = listings.filter((raw) => raw.id && raw.company_name && raw.title && raw.url)

describe('listings.json fits the job_postings schema', () => {
  it('has listings to check', () => {
    expect(usable.length).toBeGreaterThan(0)
  })

  for (const column of [
    'employer_name',
    'position',
    'job_location',
    'application_link',
    'source_id',
    'source_repo',
  ] as const) {
    it(`every ${column} fits its column`, () => {
      const limit = declaredWidth(column)
      if (limit === null) return // TEXT — unbounded.

      const offenders = usable
        .map((raw) => mapped(raw)[column])
        .filter((value) => String(value).length > limit)
        .map((value) => `${String(value).length} chars: ${String(value).slice(0, 60)}…`)

      expect(offenders, `${column} is VARCHAR(${limit})`).toEqual([])
    })
  }
})
