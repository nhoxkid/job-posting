import { useState } from 'react'
import { Input, Label, Select } from '../components/ui'
import { JobList } from '../features/jobs'
import { EMPLOYMENT_TYPES, type EmploymentType, type JobQuery } from '../types/job'

export function JobsPage() {
  const [search, setSearch] = useState('')
  const [employmentType, setEmploymentType] = useState<EmploymentType | ''>('')

  const query: JobQuery = {
    search: search.trim() || undefined,
    employmentType: employmentType || undefined,
    status: 'open',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Open positions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search and filter available roles.</p>
      </div>

      <form className="grid gap-4 sm:grid-cols-[1fr_220px]" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="search"
            placeholder="Title, company, or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType | '')}
          >
            <option value="">All types</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      </form>

      <JobList query={query} />
    </div>
  )
}
