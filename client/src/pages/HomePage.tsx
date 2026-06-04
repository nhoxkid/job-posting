import { Link } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui'

const FEATURES = [
  { title: 'Search & filter', body: 'Find roles by keyword, type, and location.' },
  { title: 'Post in minutes', body: 'Publish a job through a simple, validated form.' },
  { title: 'Built to scale', body: 'Typed React client and Express API on PostgreSQL.' },
]

export function HomePage() {
  return (
    <div className="space-y-16">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find your next <span className="text-primary">role</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Browse curated job postings from companies hiring right now.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/jobs">
            <Button size="lg">Browse jobs</Button>
          </Link>
          <Link to="/jobs/new">
            <Button size="lg" variant="outline">
              Post a job
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
