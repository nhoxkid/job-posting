import { Container } from './Container'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-8">
      <Container className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
        <span>JobBoard — a full-stack job posting platform.</span>
        <span>Built with React, Express &amp; PostgreSQL.</span>
      </Container>
    </footer>
  )
}
