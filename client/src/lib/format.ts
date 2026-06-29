/**
 * Presentation helpers. Pure functions for formatting domain values.
 */

import type { Job } from '../types/job'

const EMPLOYMENT_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary',
}

/** Turn "full-time" into a display label like "Full-time". */
export function formatEmploymentType(type: string): string {
  return EMPLOYMENT_LABELS[type] ?? type
}

/**
 * `Intl.NumberFormat` is costly to construct, so cache one formatter per
 * currency. Job lists render this hundreds of times — building it once per
 * currency instead of once per call is the difference that matters.
 */
const currencyFormatters = new Map<string, Intl.NumberFormat>()

function currencyFormatter(currency: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    })
    currencyFormatters.set(currency, formatter)
  }
  return formatter
}

/** Format a salary range, e.g. "$80,000 – $110,000" or "$45/hr". */
export function formatSalary(job: Pick<Job, 'salaryMin' | 'salaryMax' | 'currency'>): string {
  const { salaryMin, salaryMax } = job
  if (salaryMin == null && salaryMax == null) return 'Not disclosed'

  const currency = job.currency || 'USD'
  const fmt = (value: number) => {
    try {
      return currencyFormatter(currency).format(value)
    } catch {
      return `${currency} ${value.toLocaleString()}`
    }
  }

  if (salaryMin != null && salaryMax != null) {
    return salaryMin === salaryMax ? fmt(salaryMin) : `${fmt(salaryMin)} – ${fmt(salaryMax)}`
  }
  return fmt((salaryMin ?? salaryMax) as number)
}

/** Format an ISO timestamp as a short relative time, e.g. "3h ago", "2d ago". */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const sec = Math.round(diffMs / 1000)
  if (sec < 60) return 'just now'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min}m ago`
  const hours = Math.round(min / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.round(months / 12)}y ago`
}
