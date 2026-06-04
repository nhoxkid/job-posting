import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription, Card, CardContent } from '../components/ui'
import { JobForm, useCreateJob } from '../features/jobs'

export function NewJobPage() {
  const navigate = useNavigate()
  const { mutate, isPending, isError, error } = useCreateJob()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post a new job</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below to publish a listing.
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <JobForm
            submitting={isPending}
            onSubmit={(values) => mutate(values, { onSuccess: () => navigate('/jobs') })}
          />
        </CardContent>
      </Card>
    </div>
  )
}
