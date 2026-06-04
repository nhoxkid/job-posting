/**
 * Presentation helpers (scaffold). Pure functions for formatting domain values.
 * TODO: implement.
 */

import type { Job } from '../types/job'

export function formatSalary(_job: Pick<Job, 'salaryMin' | 'salaryMax' | 'currency'>): string {
  // TODO: format a salary range, e.g. "$80,000 – $110,000"
  return ''
}

export function formatRelativeTime(_iso: string): string {
  // TODO: format an ISO timestamp as "3 days ago"
  return ''
}

export function formatEmploymentType(_type: string): string {
  // TODO: turn "full-time" into a display label
  return ''
}
