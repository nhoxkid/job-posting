/**
 * Presentation helpers. Pure functions for formatting domain values.
 */

import type { Job, JobType, WorkModel } from '../types/job'

const JOB_TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  'new grad': 'New Grad',
}

/** Turn "internship" into a display label like "Internship". */
export function formatJobType(type: JobType | string): string {
  return JOB_TYPE_LABELS[type] ?? type
}

const WORK_MODEL_LABELS: Record<string, string> = {
  'In-person': 'In-person',
  remote: 'Remote',
  hybrid: 'Hybrid',
}

/** Turn "remote" into a display label like "Remote". */
export function formatWorkModel(model: WorkModel | string | null): string {
  if (!model) return 'Not specified'
  return WORK_MODEL_LABELS[model] ?? model
}

/** Format an ISO date or date string as a short relative time, e.g. "3h ago", "2d ago". */
export function formatRelativeTime(dateStr: string): string {
  const then = new Date(dateStr).getTime()
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

/** Format number of applicants as a display string. */
export function formatApplicants(count: number): string {
  if (count === 0) return 'No applicants yet'
  if (count === 1) return '1 applicant'
  return `${count} applicants`
}

/** Legacy aliases for backward compatibility with older components. */
export function formatEmploymentType(type: string): string {
  return formatJobType(type)
}

export function formatSalary(job: Pick<Job, 'numberOfApplicants'>): string {
  return formatApplicants(job.numberOfApplicants)
}
