import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { ThemeToggle } from '../ThemeToggle'
import { Button } from '../ui'
import { Container } from './Container'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors hover:text-foreground',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <NavLink to="/" className="text-lg font-bold">
          Job<span className="text-primary">Board</span>
        </NavLink>

        <nav className="flex items-center gap-6">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavLink to="/jobs/new">
            <Button size="sm">Post a job</Button>
          </NavLink>
        </div>
      </Container>
    </header>
  )
}
