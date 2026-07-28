/**
 * Lever job boards.
 *
 * Like Greenhouse, Lever exposes each customer's postings as public JSON meant
 * for consumption by third parties:
 *
 *   https://api.lever.co/v0/postings/<company>?mode=json
 */

import type { JobProvider, RawJob } from '../types'
import { fetchJson } from '../http'

interface LeverPosting {
  id: string
  text: string
  hostedUrl: string
  applyUrl?: string
  createdAt?: number
  descriptionPlain?: string
  description?: string
  categories?: {
    location?: string
    commitment?: string
    team?: string
  }
  workplaceType?: string
}

export function leverProvider(company: string, companyName?: string): JobProvider {
  return {
    slug: 'lever',
    label: `Lever (${company})`,
    isConfigured: () => company.length > 0,

    async fetch(): Promise<RawJob[]> {
      const url = `https://api.lever.co/v0/postings/${encodeURIComponent(company)}?mode=json`
      const postings = await fetchJson<LeverPosting[]>(url)

      return (postings ?? []).map((post) => ({
        externalId: `${company}:${post.id}`,
        title: post.text,
        company: companyName ?? company,
        location: post.categories?.location ?? '',
        description: post.descriptionPlain ?? post.description ?? '',
        applyUrl: post.applyUrl ?? post.hostedUrl,
        postedAt: post.createdAt ? new Date(post.createdAt).toISOString() : null,
        remoteHint: post.workplaceType?.toLowerCase() === 'remote',
        // Lever's "commitment" is where Intern/Full-time lives, and it is often
        // the only place a posting is marked as an internship.
        employmentTypeHint: post.categories?.commitment,
      }))
    },
  }
}

/** Build providers for every company listed in INGEST_LEVER_COMPANIES. */
export function leverProviders(companies: string[]): JobProvider[] {
  return companies.map((entry) => {
    const [slug, name] = entry.split('=')
    return leverProvider(slug.trim(), name?.trim())
  })
}
