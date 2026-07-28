/**
 * On-demand ingestion trigger.
 *
 * Ingestion normally runs as its own process (`npm run ingest`), which is right
 * for production: a crawl is bursty and slow and shouldn't share a process with
 * request serving.
 *
 * That has one awkward consequence in development. With `DB_DRIVER=memory` the
 * repository lives inside a process, so a separate CLI run populates a store
 * that exits moments later and the API never sees a single scraped job. This
 * endpoint runs the same pipeline *inside* the API process, so the jobs land in
 * the repository the API is actually serving from.
 *
 * Disabled in production, where the CLI plus a real database is the supported
 * path and an unauthenticated endpoint that triggers thousands of outbound
 * requests would be an obvious abuse vector.
 */

import { Router } from 'express'
import { env } from '../config/env'
import { runIngest } from '../ingest/ingest.service'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiError } from '../utils/ApiError'

export const ingestRoutes = Router()

/** Guards against overlapping runs, which would double the outbound traffic. */
let running = false

// POST /api/ingest — run the pipeline into this process's repository.
ingestRoutes.post(
  '/',
  asyncHandler(async (req, res) => {
    if (env.isProduction) {
      throw ApiError.notFound('Not available in production. Use `npm run ingest`.')
    }
    if (running) {
      throw ApiError.badRequest('An ingestion run is already in progress.')
    }

    running = true
    try {
      const enrichLimit = Number(req.query.enrich ?? env.ingestEnrichLimit)
      const summary = await runIngest({ enrichLimit })
      res.json({
        ...summary.totals,
        providers: summary.reports.map((r) => ({
          provider: r.provider,
          fetched: r.fetched,
          inserted: r.inserted,
          updated: r.updated,
          duplicates: r.duplicates,
          skipped: r.skipped,
          error: r.error,
        })),
      })
    } finally {
      running = false
    }
  }),
)
