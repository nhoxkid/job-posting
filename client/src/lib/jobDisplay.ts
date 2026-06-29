/**
 * Small presentation helpers specific to the RoleVault job cards/tables:
 * company avatar initials, logo colours, and the visa-sponsorship convention.
 */

import type { Job } from '../types/job'

/** A job "sponsors visas" when it carries the conventional sponsorship tag. */
export function sponsorsVisa(job: Pick<Job, 'tags'>): boolean {
  return job.tags.some((tag) => /sponsor/i.test(tag))
}

/** Two-letter monogram for a company avatar, e.g. "Acme Labs" -> "AL". */
export function companyInitials(company: string): string {
  const words = company.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '??'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const LOGO_PALETTES = [
  { bg: '#E7F3EC', fg: '#12805A' },
  { bg: '#EEF2F1', fg: '#46554F' },
]

/** Deterministic logo colours derived from the company name. */
export function logoColors(company: string): { bg: string; fg: string } {
  let hash = 0
  for (let i = 0; i < company.length; i++) hash = (hash + company.charCodeAt(i)) % 997
  return LOGO_PALETTES[hash % LOGO_PALETTES.length]
}

/** "San Francisco, US" stays; remote roles get a "Remote" prefix when needed. */
export function displayLocation(job: Pick<Job, 'location' | 'remote'>): string {
  if (job.remote && !/remote/i.test(job.location)) return `Remote · ${job.location}`
  return job.location
}
