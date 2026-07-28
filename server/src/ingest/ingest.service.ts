/**
 * Ingestion orchestration: fetch → normalise → de-duplicate → persist.
 *
 * De-duplication happens at three levels, because a duplicate can enter from
 * three different directions:
 *
 *   1. Within one provider's batch — a feed that lists the same opening twice.
 *      Collapsed in memory before any write.
 *   2. Across providers in the same run — the same job on a company's
 *      Greenhouse board and on an aggregator. Also collapsed in memory, and the
 *      earlier provider wins because the registry lists direct ATS sources
 *      first: they are the authoritative copy.
 *   3. Against rows already stored — handled by the unique `fingerprint` and
 *      the upsert in the repository, which is the only level that holds under
 *      two ingestion runs happening at once.
 */

import type { IngestReport, JobProvider, RawJob } from './types'
import { enrichDescriptions } from './enrich'
import { normalizeJob, type NormalizedJob } from './normalize'
import { buildProviders } from './providers'
import { jobRepository, type JobRepository } from '../repositories/job.repository'
import { env } from '../config/env'

export interface IngestOptions {
  providers?: JobProvider[]
  repository?: JobRepository
  /** Receives progress lines. Defaults to console. */
  log?: (message: string) => void
  /**
   * How many postings per provider may have their full description fetched
   * from the original ATS. 0 disables enrichment (used by tests, which must
   * not reach the network).
   */
  enrichLimit?: number
}

export interface IngestSummary {
  reports: IngestReport[]
  totals: { fetched: number; skipped: number; inserted: number; updated: number; duplicates: number }
}

export async function runIngest(options: IngestOptions = {}): Promise<IngestSummary> {
  const providers = options.providers ?? buildProviders()
  const repository = options.repository ?? jobRepository
  const log = options.log ?? ((message: string) => console.log(message))
  const enrichLimit = options.enrichLimit ?? Number(env.ingestEnrichLimit)

  const reports: IngestReport[] = []

  // Fingerprints already claimed during THIS run. This is what stops the same
  // opening being written twice when two providers both carry it.
  const seenFingerprints = new Set<string>()

  for (const provider of providers) {
    const report: IngestReport = {
      provider: provider.label,
      fetched: 0,
      skipped: 0,
      inserted: 0,
      updated: 0,
      duplicates: 0,
    }

    try {
      const fetched = await provider.fetch()
      report.fetched = fetched.length

      // Enrich before normalising: the real description feeds skill extraction
      // and the content hash, so doing it afterwards would mean re-deriving both.
      const raw: RawJob[] = await enrichDescriptions(fetched, enrichLimit)

      const batch: NormalizedJob[] = []

      for (const item of raw) {
        const normalized = normalizeJob(item, provider.slug)
        // Not an early-careers role, or missing required fields.
        if (!normalized) {
          report.skipped++
          continue
        }
        if (seenFingerprints.has(normalized.fingerprint)) {
          report.duplicates++
          continue
        }
        seenFingerprints.add(normalized.fingerprint)
        batch.push(normalized)
      }

      const result = await repository.upsertMany(batch)
      report.inserted = result.inserted
      report.updated = result.updated
      report.duplicates += result.unchanged

      log(
        `${provider.label}: fetched ${report.fetched}, kept ${batch.length}, ` +
          `inserted ${report.inserted}, updated ${report.updated}, ` +
          `duplicate/unchanged ${report.duplicates}, skipped ${report.skipped}`,
      )
    } catch (error) {
      // One bad source must not abort the run — the others still have value.
      report.error = error instanceof Error ? error.message : String(error)
      log(`${provider.label}: FAILED — ${report.error}`)
    }

    reports.push(report)
  }

  const totals = reports.reduce(
    (acc, r) => ({
      fetched: acc.fetched + r.fetched,
      skipped: acc.skipped + r.skipped,
      inserted: acc.inserted + r.inserted,
      updated: acc.updated + r.updated,
      duplicates: acc.duplicates + r.duplicates,
    }),
    { fetched: 0, skipped: 0, inserted: 0, updated: 0, duplicates: 0 },
  )

  return { reports, totals }
}
