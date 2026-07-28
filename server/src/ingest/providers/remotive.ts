/**
 * Remotive — a public remote-jobs API.
 *
 * Free, documented, no key required, and explicitly offered for third-party
 * consumption. Useful here because the ATS providers are per-company, so this
 * is the one source that widens coverage across many employers at once.
 *
 *   https://remotive.com/api/remote-jobs
 */

import type { JobProvider, RawJob } from '../types'
import { fetchJson } from '../http'

interface RemotiveJob {
  id: number
  title: string
  company_name: string
  candidate_required_location?: string
  publication_date?: string
  description?: string
  url: string
  job_type?: string
}

interface RemotiveResponse {
  jobs?: RemotiveJob[]
}

export function remotiveProvider(limit = 200): JobProvider {
  return {
    slug: 'remotive',
    label: 'Remotive',
    isConfigured: () => true,

    async fetch(): Promise<RawJob[]> {
      const url = `https://remotive.com/api/remote-jobs?limit=${limit}`
      const body = await fetchJson<RemotiveResponse>(url)

      return (body.jobs ?? []).map((job) => ({
        externalId: String(job.id),
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location ?? 'Remote',
        description: job.description ?? '',
        applyUrl: job.url,
        postedAt: job.publication_date ?? null,
        // Every posting on Remotive is remote by definition.
        remoteHint: true,
        employmentTypeHint: job.job_type,
      }))
    },
  }
}
