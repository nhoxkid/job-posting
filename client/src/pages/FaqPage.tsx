import { useState } from 'react'
import { usePalette } from '../lib/palette'

const faqGroups = [
  {
    title: 'Getting started',
    items: [
      {
        q: 'How does RoleVault match me to jobs?',
        a: 'We parse your uploaded resume to detect skills and experience level, then rank every open role by overlap with its required skills. Each recommendation shows the exact skills matched and any gaps.',
      },
      {
        q: 'Do I need an account to browse?',
        a: 'No. You can browse and search all listings as a guest. An account unlocks resume matching, recommendations, and saved filters.',
      },
    ],
  },
  {
    title: 'Applications & sponsorship',
    items: [
      {
        q: 'How do I set up automatic tracking for new postings?',
        a: 'Save a search from the Browse page, then enable "Email new jobs matching my filters" in Profile settings. We notify you the moment a matching role is posted.',
      },
      {
        q: 'What does "posted 30 days ago" usually mean?',
        a: 'Older postings are often still open but draw far more applicants. We surface the posting date so you can prioritise fresh, less-competitive roles.',
      },
      {
        q: 'How do I know if a role offers visa sponsorship?',
        a: 'Every listing carries a sponsorship badge. Filter to "Sponsors visas only" on the Browse page to hide roles that do not sponsor.',
      },
    ],
  },
  {
    title: 'Your resume & data',
    items: [
      {
        q: 'Is my resume shared with employers?',
        a: 'Never automatically. Your resume is only used to generate matches on your side. Employers see an application only when you choose to apply.',
      },
      {
        q: 'How do I update or remove my resume?',
        a: 'Go to Profile then Resume & Matching to re-upload a new file or delete the current one. Recommendations refresh within a minute.',
      },
    ],
  },
]

/** Frequently asked questions with a single-open accordion. */
export function FaqPage() {
  const p = usePalette()
  const [open, setOpen] = useState<string | null>('g0-0')

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 28px 60px' }}>
      <h1
        className="rv-display"
        style={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.025em', margin: '0 0 6px' }}
      >
        Frequently Asked Questions
      </h1>
      <p style={{ fontSize: 16, color: p.body, margin: '0 0 32px' }}>
        Helpful suggestions and general advice on applications and the job board.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
        {faqGroups.map((g, gi) => (
          <div key={g.title}>
            <h2
              className="rv-display"
              style={{
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: '-0.01em',
                margin: '0 0 14px',
                color: p.accent,
              }}
            >
              {g.title}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {g.items.map((it, ii) => {
                const id = `g${gi}-${ii}`
                const isOpen = open === id
                return (
                  <div
                    key={id}
                    onClick={() => setOpen(isOpen ? null : id)}
                    className="rv-faq-card"
                    style={{
                      background: p.surface,
                      border: `1px solid ${p.border}`,
                      borderRadius: 16,
                      padding: '18px 20px',
                      cursor: 'pointer',
                      boxShadow: p.shadow,
                      transition: 'border-color .15s',
                      alignSelf: 'start',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <span
                        className="rv-display"
                        style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.35 }}
                      >
                        {it.q}
                      </span>
                      <span
                        style={{
                          color: p.accent,
                          fontSize: 18,
                          fontWeight: 700,
                          flexShrink: 0,
                          lineHeight: 1.2,
                        }}
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </div>
                    {isOpen && (
                      <p
                        style={{ fontSize: 14, lineHeight: 1.6, color: p.body, margin: '12px 0 0' }}
                      >
                        {it.a}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
