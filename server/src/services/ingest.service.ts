/**
 * Ingest service: imports and upserts job postings from structured JSON
 * (e.g., listings.json from Vansh/Simplify GitHub internship boards).
 */

import fs from 'fs'
import path from 'path'
import type { CreateJobInput, JobType } from '../models/job'
import { jobRepository, type JobRepository } from '../repositories/job.repository'

export interface RawListing {
  id: string
  company_name: string
  title: string
  url: string
  locations?: string[]
  sponsorship?: string
  active?: boolean
  season?: string
  source?: string
  date_posted?: number
  date_updated?: number
  company_url?: string
  is_visible?: boolean
}

export interface IngestResult {
  created: number
  updated: number
  total: number
}

export class IngestService {
  constructor(private readonly repo: JobRepository = jobRepository) {}

  /**
   * Reads the local file at `server/src/data/listings.json` and imports all jobs.
   */
  async ingestFromLocalFile(): Promise<IngestResult> {
    const filePath = path.resolve(__dirname, '../data/listings.json')
    if (!fs.existsSync(filePath)) {
      throw new Error(`Local listings file not found at: ${filePath}`)
    }
    const rawContent = fs.readFileSync(filePath, 'utf8')
    const listings = JSON.parse(rawContent) as RawListing[]
    return this.ingestListings(listings)
  }

  /**
   * Imports an array of raw listing items, mapping them to domain models
   * and upserting by sourceId.
   */
  async ingestListings(listings: RawListing[]): Promise<IngestResult> {
    let created = 0
    let updated = 0

    for (const raw of listings) {
      if (!raw.id || !raw.company_name || !raw.title || !raw.url) {
        continue // skip malformed listings
      }

      const isRemote =
        raw.locations?.some((loc) => /remote/i.test(loc)) ?? false

      const jobLocation =
        raw.locations && raw.locations.length > 0
          ? raw.locations.join('; ')
          : 'Remote'

      const sponsorshipAvailable =
        raw.sponsorship === 'Offers Sponsorship' || raw.sponsorship === 'Other'

      const postingDate = raw.date_posted
        ? new Date(raw.date_posted * 1000).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      const jobType: JobType =
        raw.title.toLowerCase().includes('new grad') ||
        raw.title.toLowerCase().includes('full time')
          ? 'new grad'
          : 'internship'

      const input: CreateJobInput = {
        employerName: raw.company_name,
        position: raw.title,
        jobType,
        jobLocation,
        workModel: isRemote ? 'remote' : 'In-person',
        sponsorshipAvailable,
        applicationLink: raw.url,
        postingDate,
        sourceId: raw.id,
        sourceRepo: raw.source ?? 'github',
        season: raw.season ?? null,
        active: raw.active !== undefined ? raw.active : true,
      }

      const existing = await this.repo.findBySourceId(raw.id)
      if (existing) {
        await this.repo.update(existing.jobId, {
          active: input.active,
          applicationLink: input.applicationLink,
          jobLocation: input.jobLocation,
        })
        updated++
      } else {
        await this.repo.create(input)
        created++
      }
    }

    return {
      created,
      updated,
      total: listings.length,
    }
  }
}

export const ingestService = new IngestService()
