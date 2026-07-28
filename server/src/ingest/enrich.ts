/**
 * Description enrichment.
 *
 * The curated listing sources carry title, company, location and sponsorship
 * but no posting body — and the detail screen is mostly body. Each listing does
 * link to the original posting, and when that link lands on an ATS with a
 * public JSON API we can fetch the real description from it.
 *
 * Only Greenhouse, Ashby and Lever are handled, because those three publish
 * board APIs intended for third-party use. Everything else (Workday, iCIMS,
 * company career sites) keeps the composed summary and its link out — reading
 * those would mean scraping rendered HTML from sites that haven't invited it.
 *
 * Roughly a third of listings enrich in practice. That is a deliberate ceiling,
 * not a bug to work around.
 */

import { fetchJson } from './http'
import { htmlToText } from './normalize'
import type { RawJob } from './types'

/** Concurrent enrichment requests. Low on purpose — these are other people's APIs. */
const CONCURRENCY = 6

interface Resolver {
  /** Extracts the API URL for a posting, or null when the link isn't handled. */
  apiUrl(url: string): string | null
  /** Pulls the description out of that API's response. */
  extract(body: unknown): string | null
}

const RESOLVERS: Resolver[] = [
  {
    // https://boards.greenhouse.io/<board>/jobs/<id>
    // https://job-boards.greenhouse.io/<board>/jobs/<id>
    apiUrl(url) {
      const match = url.match(/greenhouse\.io\/([^/?#]+)\/jobs\/(\d+)/)
      return match ? `https://boards-api.greenhouse.io/v1/boards/${match[1]}/jobs/${match[2]}` : null
    },
    extract(body) {
      return (body as { content?: string })?.content ?? null
    },
  },
  {
    // https://jobs.ashbyhq.com/<org>/<uuid>
    apiUrl(url) {
      const match = url.match(/jobs\.ashbyhq\.com\/([^/?#]+)\/([0-9a-f-]{36})/i)
      return match
        ? `https://api.ashbyhq.com/posting-api/job-board/${match[1]}?includeCompensation=false`
        : null
    },
    extract(body) {
      // Ashby has no single-posting endpoint, so the board is fetched and the
      // caller matches by id. Handled in `enrichOne` via the cache below.
      return (body as { jobs?: { descriptionHtml?: string }[] })?.jobs?.[0]?.descriptionHtml ?? null
    },
  },
  {
    // https://jobs.lever.co/<company>/<uuid>
    apiUrl(url) {
      const match = url.match(/jobs\.lever\.co\/([^/?#]+)\/([0-9a-f-]{36})/i)
      return match ? `https://api.lever.co/v0/postings/${match[1]}/${match[2]}` : null
    },
    extract(body) {
      const post = body as { descriptionPlain?: string; description?: string }
      return post?.descriptionPlain ?? post?.description ?? null
    },
  },
]

/** Ashby needs the whole board, so boards are fetched once and reused. */
type AshbyBoard = { jobs?: { id?: string; descriptionHtml?: string; descriptionPlain?: string }[] }

async function enrichOne(job: RawJob, ashbyCache: Map<string, Promise<AshbyBoard>>): Promise<RawJob> {
  // Ashby is special-cased: one board request serves every posting from that org.
  const ashby = job.applyUrl.match(/jobs\.ashbyhq\.com\/([^/?#]+)\/([0-9a-f-]{36})/i)
  if (ashby) {
    const [, org, postingId] = ashby
    let board = ashbyCache.get(org)
    if (!board) {
      board = fetchJson<AshbyBoard>(
        `https://api.ashbyhq.com/posting-api/job-board/${org}?includeCompensation=false`,
      ).catch(() => ({}) as AshbyBoard)
      ashbyCache.set(org, board)
    }
    const found = (await board).jobs?.find((entry) => entry.id === postingId)
    const text = htmlToText(found?.descriptionHtml ?? found?.descriptionPlain ?? '')
    return text.length > 200 ? { ...job, description: text } : job
  }

  for (const resolver of RESOLVERS) {
    const apiUrl = resolver.apiUrl(job.applyUrl)
    if (!apiUrl || apiUrl.includes('ashbyhq')) continue
    try {
      const body = await fetchJson<unknown>(apiUrl)
      const text = htmlToText(resolver.extract(body) ?? '')
      // A very short body is usually a stub or an error page; the composed
      // summary is more useful than three words of boilerplate.
      if (text.length > 200) return { ...job, description: text }
    } catch {
      // A dead posting link is expected in a curated feed — keep the summary.
    }
    return job
  }
  return job
}

/**
 * Fetch real descriptions where possible.
 *
 * `limit` caps how many postings are enriched in one run so a crawl stays
 * polite and bounded; the rest keep their composed summary. Returns a new
 * array — the input is not mutated.
 */
export async function enrichDescriptions(jobs: RawJob[], limit: number): Promise<RawJob[]> {
  if (limit <= 0) return jobs

  const ashbyCache = new Map<string, Promise<AshbyBoard>>()
  const result = [...jobs]
  // Only postings whose link is on a supported ATS are worth queueing.
  const queue = result
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => RESOLVERS.some((r) => r.apiUrl(job.applyUrl) !== null))
    .slice(0, limit)

  let cursor = 0
  async function worker(): Promise<void> {
    while (cursor < queue.length) {
      const item = queue[cursor++]
      result[item.index] = await enrichOne(item.job, ashbyCache)
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker))
  return result
}
