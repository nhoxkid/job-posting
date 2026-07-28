import { usePalette } from '../../lib/palette'
import type { Sponsorship } from '../../types/job'

/**
 * How a posting's visa sponsorship is shown.
 *
 * Three states, deliberately distinct. The common case by far is `unknown` —
 * most postings simply never mention sponsorship — and it gets neutral styling
 * with the words "Not stated" rather than being folded into "No". Folding it
 * would tell an international candidate the employer refuses to sponsor when
 * the employer said nothing at all, which is the single most costly thing this
 * board could get wrong.
 */

export const SPONSORSHIP_LABELS: Record<Sponsorship, string> = {
  yes: '✓ Sponsors visa',
  no: 'No sponsorship',
  unknown: 'Not stated',
}

/** Compact wording for the dense Browse table. */
export const SPONSORSHIP_SHORT: Record<Sponsorship, string> = {
  yes: '✓ Yes',
  no: 'No',
  unknown: 'Not stated',
}

export function SponsorshipBadge({
  sponsorship,
  short = false,
}: {
  sponsorship: Sponsorship
  short?: boolean
}) {
  const p = usePalette()
  const label = short ? SPONSORSHIP_SHORT[sponsorship] : SPONSORSHIP_LABELS[sponsorship]

  const tone = {
    yes: { color: p.accent, background: p.accentSoftBg, border: 'none' },
    no: { color: p.muted, background: p.chipBg, border: 'none' },
    // Outlined rather than filled: it reads as "no data" instead of a verdict.
    unknown: { color: p.muted, background: 'transparent', border: `1px dashed ${p.border}` },
  }[sponsorship]

  return (
    <span
      title={
        sponsorship === 'unknown'
          ? 'This posting does not say whether it sponsors visas.'
          : undefined
      }
      style={{
        fontWeight: 600,
        fontSize: 12,
        borderRadius: 999,
        padding: '4px 10px',
        whiteSpace: 'nowrap',
        ...tone,
      }}
    >
      {label}
    </span>
  )
}
