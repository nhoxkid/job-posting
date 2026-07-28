/**
 * Curated early-careers listings from the SimplifyJobs boards.
 *
 * These are the highest-value sources for this product by a wide margin. The
 * per-company ATS providers each surface a handful of early-careers roles
 * buried in hundreds of senior ones; these repositories are *only*
 * early-careers roles, aggregated across thousands of employers, and published
 * as structured JSON in a public repository for exactly this kind of
 * consumption.
 *
 *   https://github.com/SimplifyJobs/Summer2026-Internships
 *   https://github.com/SimplifyJobs/New-Grad-Positions
 *
 * Two things make them better than raw ATS crawling:
 *
 *   - Sponsorship is a recorded field rather than something inferred from
 *     prose, so `spons` stops being a guess.
 *   - Every row carries a link to the original posting, which the enrichment
 *     step in `enrich.ts` follows to pull real descriptions.
 *
 * The trade-off is that the listing itself has no description body, which is
 * why enrichment exists. Rows that can't be enriched still get a useful
 * summary composed from the structured fields.
 */

import type { JobProvider, RawJob } from '../types'
import { fetchJson } from '../http'

interface SimplifyListing {
  id: string
  company_name: string
  title: string
  /** Free-text locations, e.g. ["Seattle, WA"] or ["Remote"]. */
  locations?: string[]
  /** Season labels, e.g. ["Summer 2026"]. */
  terms?: string[]
  /** Broad discipline, e.g. "Software", "Data Science". */
  category?: string
  degrees?: string[]
  /** Unix seconds. */
  date_posted?: number
  date_updated?: number
  url: string
  company_url?: string
  /** Whether the posting is still open. */
  active?: boolean
  /** Whether the maintainers consider it publishable. */
  is_visible?: boolean
  sponsorship?: string
}

/**
 * Map the dataset's sponsorship wording onto our tri-state.
 *
 * Only ~12 of 4,000+ listings carry an explicit answer; the rest say "Other",
 * which is an absence of information rather than a "no".
 */
function parseSponsorship(value?: string): 'yes' | 'no' | undefined {
  if (!value) return undefined
  if (value === 'Offers Sponsorship') return 'yes'
  if (value === 'Does Not Offer Sponsorship' || value === 'U.S. Citizenship is Required') {
    return 'no'
  }
  // "Other" means the dataset doesn't know. Returning undefined lets the
  // description-based detector try, and failing that the row lands on
  // 'unknown' — which is the truth.
  return undefined
}

/** A readable stand-in until (or unless) enrichment fetches the real body. */
function summarise(listing: SimplifyListing): string {
  const lines = [`${listing.company_name} is hiring for ${listing.title}.`, '']
  if (listing.category) lines.push(`Category: ${listing.category}`)
  if (listing.terms?.length) lines.push(`Term: ${listing.terms.join(', ')}`)
  if (listing.locations?.length) lines.push(`Location: ${listing.locations.join(' · ')}`)
  if (listing.degrees?.length) lines.push(`Degrees: ${listing.degrees.join(', ')}`)
  if (listing.sponsorship && listing.sponsorship !== 'Other') {
    lines.push(`Sponsorship: ${listing.sponsorship}`)
  }
  lines.push('', 'Open the original posting for the full description.')
  return lines.join('\n')
}

function toRawJob(listing: SimplifyListing): RawJob {
  const posted = listing.date_posted ?? listing.date_updated
  return {
    externalId: listing.id,
    title: listing.title,
    company: listing.company_name,
    location: listing.locations?.join(' · ') ?? '',
    description: summarise(listing),
    applyUrl: listing.url,
    postedAt: posted ? new Date(posted * 1000).toISOString() : null,
    sponsorshipHint: parseSponsorship(listing.sponsorship),
    // The repository is entirely internships / new-grad roles, so the title
    // classifier gets a nudge for entries whose wording is unusual.
    employmentTypeHint: listing.terms?.join(' '),
  }
}

function simplifyProvider(slug: string, label: string, url: string): JobProvider {
  return {
    slug,
    label,
    isConfigured: () => true,

    async fetch(): Promise<RawJob[]> {
      const listings = await fetchJson<SimplifyListing[]>(url)
      return (listings ?? [])
        // The file keeps historical rows; only live, publishable ones belong on
        // the board. Without this the feed is ~14,000 mostly-closed postings.
        .filter((listing) => listing.active !== false && listing.is_visible !== false)
        .filter((listing) => listing.title && listing.company_name && listing.url)
        .map(toRawJob)
    },
  }
}

const RAW = 'https://raw.githubusercontent.com/SimplifyJobs'

export function simplifyInternshipsProvider(): JobProvider {
  return simplifyProvider(
    'simplify-internships',
    'Simplify — Summer 2026 Internships',
    `${RAW}/Summer2026-Internships/dev/.github/scripts/listings.json`,
  )
}

export function simplifyNewGradProvider(): JobProvider {
  return simplifyProvider(
    'simplify-newgrad',
    'Simplify — New Grad Positions',
    `${RAW}/New-Grad-Positions/dev/.github/scripts/listings.json`,
  )
}
