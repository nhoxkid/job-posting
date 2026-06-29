import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '../components/ui'
import { JobForm, useCreateJob } from '../features/jobs'
import { usePalette } from '../lib/palette'

export function NewJobPage() {
  const p = usePalette()
  const navigate = useNavigate()
  const { mutate, isPending, isError, error } = useCreateJob()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 28px 60px' }}>
      <h1
        className="rv-display"
        style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.025em', margin: '0 0 6px' }}
      >
        Post a new job
      </h1>
      <p style={{ fontSize: 16, color: p.body, margin: '0 0 28px' }}>
        Fill in the details below to publish a listing to the board.
      </p>

      {isError && (
        <div style={{ marginBottom: 18 }}>
          <Alert variant="destructive">
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div
        style={{
          background: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: 18,
          padding: '28px 28px',
          boxShadow: p.shadow,
        }}
      >
        <JobForm
          submitting={isPending}
          onSubmit={(values) => mutate(values, { onSuccess: (job) => navigate(`/jobs/${job.id}`) })}
        />
      </div>
    </div>
  )
}
