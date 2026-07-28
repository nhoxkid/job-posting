import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Clickable } from './Clickable'

describe('Clickable', () => {
  it('exposes itself as a button to assistive tech', () => {
    render(<Clickable onClick={() => {}}>Browse jobs</Clickable>)
    expect(screen.getByRole('button', { name: 'Browse jobs' })).toBeInTheDocument()
  })

  it('takes a tab stop so keyboard users can reach it', async () => {
    const user = userEvent.setup()
    render(<Clickable onClick={() => {}}>Browse jobs</Clickable>)

    await user.tab()

    expect(screen.getByRole('button')).toHaveFocus()
  })

  it.each(['{Enter}', ' '])('activates on %s, like a native button', async (key) => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Clickable onClick={onClick}>Browse jobs</Clickable>)

    screen.getByRole('button').focus()
    await user.keyboard(key)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('ignores other keys', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Clickable onClick={onClick}>Browse jobs</Clickable>)

    screen.getByRole('button').focus()
    await user.keyboard('{ArrowDown}a')

    expect(onClick).not.toHaveBeenCalled()
  })

  it('prefers an explicit label when the visible text is not descriptive', () => {
    render(
      <Clickable as="div" onClick={() => {}} label="View SWE Intern at Acme">
        <span>SWE Intern</span>
      </Clickable>,
    )
    expect(screen.getByRole('button', { name: 'View SWE Intern at Acme' })).toBeInTheDocument()
  })
})
