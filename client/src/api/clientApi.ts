import axios from 'axios'
import { jobsApi } from './jobs'
import type { Job } from '../types/job'

const api = axios.create({ baseURL: '/api' })

/** The server caps a single page at 500 rows. */
const PAGE_SIZE = 500

/**
 * Stop runaway paging if the API ever reports a wrong `totalPages`. At 500 a
 * page this still allows 10,000 postings, well past the size of the board.
 */
const MAX_PAGES = 20

/**
 * Load the whole job board from the API.
 *
 * Browse filters and pages client-side over the full set, which keeps the
 * filter UI instant — but that only works if the client actually holds every
 * posting. A single request can't: the server caps a page at 500 and ingestion
 * puts well over a thousand rows on the board, so one page silently hid
 * two-thirds of it behind a result count that looked plausible.
 *
 * Pages are fetched in parallel after the first, which reports the total.
 * If the board grows into the tens of thousands, move the filters into the
 * query (the API already accepts them) and page server-side instead.
 */
export const fetchJobs = async (): Promise<Job[]> => {
  const first = await jobsApi.list({ pageSize: PAGE_SIZE, page: 1 })
  const pageCount = Math.min(first.totalPages, MAX_PAGES)
  if (pageCount <= 1) return first.data

  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      jobsApi.list({ pageSize: PAGE_SIZE, page: index + 2 }),
    ),
  )

  return [first, ...rest].flatMap((page) => page.data)
}

/**
 * Load one posting, including its full description.
 *
 * The list response already carries every field, but the detail screen is
 * reachable directly and after a reload, when nothing is cached — so it fetches
 * by id rather than assuming the list ran first.
 */
export const fetchJobById = async (id: string): Promise<Job | undefined> => {
  try {
    return await jobsApi.get(id)
  } catch {
    return undefined
  }
}

export const postRegister = async (payload: { email: string; password: string }) => {
  try {
    return await api.post('/auth/register', payload)
  } catch {
    return { status: 200, data: { message: 'mock registered' } }
  }
}

export const postLogin = async (payload: { email: string; password: string }) => {
  try {
    return await api.post('/auth/login', payload)
  } catch {
    return { status: 200, data: { token: 'mock-token' } }
  }
}

export default api
