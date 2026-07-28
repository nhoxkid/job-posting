import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'

/**
 * A span that behaves like a button.
 *
 * The design screens use spans and divs as click targets in ~30 places. A bare
 * `<span onClick>` is invisible to anyone not using a mouse: it takes no tab
 * stop, Enter and Space do nothing, and assistive tech announces it as plain
 * text rather than something you can activate. Rather than fix that at every
 * call site, those targets go through this component.
 *
 * A real `<button>` would be the better element, but these sit inside dense
 * inline-styled layouts where the UA button styles (and its inline-block
 * sizing) change the design. `role="button"` plus a tab stop and key handling
 * gives the same semantics without touching the layout.
 *
 * The `rv-clickable` class carries `width: fit-content` and `user-select: none`
 * — see the note in styles/index.css for why both matter here.
 */
export function Clickable({
  onClick,
  className,
  style,
  children,
  label,
  as: Tag = 'span',
}: {
  onClick: () => void
  className?: string
  style?: CSSProperties
  children: ReactNode
  /** Accessible name, when the visible text isn't descriptive on its own. */
  label?: string
  as?: 'span' | 'div'
}) {
  const onKeyDown = (event: KeyboardEvent) => {
    // Match native button behaviour: both keys activate, and Space must not
    // also scroll the page.
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onClick()
  }

  return (
    <Tag
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={className ? `rv-clickable ${className}` : 'rv-clickable'}
      style={{ cursor: 'pointer', ...style }}
    >
      {children}
    </Tag>
  )
}
