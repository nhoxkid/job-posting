import axios from 'axios'
import type { Job } from '../types/job'

const api = axios.create({ baseURL: 'http://localhost:4000/api' })

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const res = await api.get<{ data: Job[] }>('/jobs', {
      params: { pageSize: 100 },
    })
    return res.data.data
  } catch {
    console.error('Failed to fetch live jobs from server')
    return []
  }
}

export const fetchJobById = async (id: number): Promise<Job | undefined> => {
  try {
    const res = await api.get<Job>(`/jobs/${id}`)
    return res.data
  } catch {
    console.error(`Failed to fetch job ${id} from server`)
    return undefined
  }
}

export default api
