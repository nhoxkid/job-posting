/**
 * Seed dataset for the job board.
 *
 * Empty by default — initial job listings are populated on startup via ingestService
 * reading from server/src/data/listings.json.
 */

import type { Job } from '../models/job'

export const seedJobs: Job[] = []
