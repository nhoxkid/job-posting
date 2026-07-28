/**
 * Greenhouse job boards.
 *
 * Greenhouse publishes each customer's board at a documented public JSON
 * endpoint intended for exactly this use — no key, no scraping, no bot
 * detection to work around. One provider instance covers one company board;
 * `greenhouseProviders()` builds a set from the configured board tokens.
 *
 *   https://boards-api.greenhouse.io/v1/boards/<token>/jobs?content=true
 */

import type { JobProvider, RawJob } from '../types'
import { fetchJson } from '../http'

interface GreenhouseJob {
  id: number
  title: string
  absolute_url: string
  updated_at: string
  content: string
  location?: { name?: string }
  metadata?: { name?: string; value?: unknown }[] | null
}

interface GreenhouseResponse {
  jobs?: GreenhouseJob[]
}

export function greenhouseProvider(boardToken: string, companyName?: string): JobProvider {
  return {
    slug: 'greenhouse',
    label: `Greenhouse (${boardToken})`,
    isConfigured: () => boardToken.length > 0,

    async fetch(): Promise<RawJob[]> {
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(boardToken)}/jobs?content=true`
      const body = await fetchJson<GreenhouseResponse>(url)

      return (body.jobs ?? []).map((job) => ({
        // Namespaced by board: Greenhouse ids are only unique within a board,
        // so two boards could otherwise collide on `(source, external_id)`.
        externalId: `${boardToken}:${job.id}`,
        title: job.title,
        company: companyName ?? boardToken,
        location: job.location?.name ?? '',
        // Greenhouse HTML-escapes the body, so it arrives double-encoded.
        description: job.content ?? '',
        applyUrl: job.absolute_url,
        postedAt: job.updated_at ?? null,
      }))
    },
  }
}

/** Build providers for every board listed in INGEST_GREENHOUSE_BOARDS. */
export function greenhouseProviders(boards: string[]): JobProvider[] {
  return boards.map((entry) => {
    // Accepts "token" or "token=Display Name".
    const [token, name] = entry.split('=')
    return greenhouseProvider(token.trim(), name?.trim())
  })
}
