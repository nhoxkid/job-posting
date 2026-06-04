import { useForm } from 'react-hook-form'
import { Button, Input, Label, Select, Textarea } from '../../../components/ui'
import { EMPLOYMENT_TYPES, type CreateJobInput } from '../../../types/job'

interface JobFormProps {
  onSubmit: (values: CreateJobInput) => void
  submitting?: boolean
}

export function JobForm({ onSubmit, submitting }: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateJobInput>({
    defaultValues: {
      employmentType: 'full-time',
      remote: false,
      currency: 'USD',
      tags: [],
      status: 'open',
      salaryMin: null,
      salaryMax: null,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title', { required: 'Title is required' })} />
        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" {...register('company', { required: 'Company is required' })} />
          {errors.company && (
            <p className="mt-1 text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location', { required: 'Location is required' })} />
          {errors.location && (
            <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="employmentType">Employment type</Label>
          <Select id="employmentType" {...register('employmentType')}>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" {...register('remote')} className="h-4 w-4" />
          Remote position
        </label>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={6}
          {...register('description', { required: 'Description is required' })}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* TODO: add salary range and tags inputs as needed. */}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Posting…' : 'Post job'}
      </Button>
    </form>
  )
}
