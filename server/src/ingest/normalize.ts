/**
 * Turns a provider's `RawJob` into the canonical `Job` shape.
 *
 * Every source describes postings differently — "Software Engineer Intern
 * (Summer 2026)" from one, "Intern, Software Engineering" from another, and
 * locations ranging from "Remote - US" to "Toronto, ON, Canada". Normalising in
 * one place is what makes cross-source de-duplication possible at all: two
 * providers only produce the same fingerprint if they first agree on what the
 * company, title and location *are*.
 */

import { createHash } from 'node:crypto'
import type { Job, JobType, Region, Sponsorship, WorkModel } from '../models/job'
import type { RawJob } from './types'

/* -------------------------------------------------------------------------- */
/* Text helpers                                                               */
/* -------------------------------------------------------------------------- */

/** Strip HTML tags and collapse entities/whitespace into readable plain text. */
export function htmlToText(input: string): string {
  return input
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&(quot|#34);/g, '"')
    .replace(/&(apos|#39);/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Aggressive normalisation used only for identity comparison.
 *
 * Lowercases, drops punctuation and collapses spaces so that
 * "Acme Labs, Inc." and "acme labs inc" resolve to the same company.
 */
function identityKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(inc|llc|ltd|limited|corp|corporation|co|gmbh|plc|the)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/* -------------------------------------------------------------------------- */
/* Classification                                                             */
/* -------------------------------------------------------------------------- */

const INTERN_PATTERN = /\b(intern|internship|industrial placement|summer analyst)\b/i
const COOP_PATTERN = /\b(co-?op)\b/i
// `graduate` needs the qualifier — a bare "Graduate" also appears in senior
// postings ("graduate degree required") — but the qualifier is often separated
// by the discipline, as in "Graduate Software Developer".
const NEW_GRAD_PATTERN =
  /\b(new ?grad|graduate\s+(\w+\s+){0,2}(program|scheme|role|engineer|developer|analyst|scientist)|entry[- ]level|university grad|campus hire|early career)\b/i

/**
 * Which early-careers bucket a posting belongs to, or null to reject it.
 *
 * RoleVault only lists early-careers roles, so anything that reads as senior is
 * dropped here rather than being stored and filtered later. Order matters:
 * "Co-op" is checked before "Intern" because co-op postings routinely say both.
 */
export function classifyJobType(title: string, hint?: string): JobType | null {
  const haystack = `${title} ${hint ?? ''}`

  if (/\b(senior|staff|principal|lead|manager|director|head of|vp|phd)\b/i.test(title)) return null

  if (COOP_PATTERN.test(haystack)) return 'Co-op'
  if (INTERN_PATTERN.test(haystack)) return 'Internship'
  if (NEW_GRAD_PATTERN.test(haystack)) return 'New Grad'
  return null
}

/**
 * Occupations that don't belong on a professional/technical early-careers board.
 *
 * RoleVault lists desk-based professional roles. The curated feeds occasionally
 * carry things like "Football Coaches Intern" — and that one is *categorised by
 * the source as AI/ML/Data*, so the category field can't be trusted to catch it.
 * The title is the only reliable signal.
 *
 * The hard part is false positives, because tech vocabulary overlaps heavily
 * with service-job vocabulary. Deliberately NOT in this list:
 *
 *   - "server"     — "Inference Server", "Server Engineering"
 *   - "driver"     — "Device Driver Engineer"
 *   - "operator"   — "Operator Framework", ML "operators"
 *   - "architect"  — a senior white-collar title
 *   - "mechanical" — "Mechanical Engineer" is exactly what we want to keep
 *
 * Every entry below is either a word with no technical meaning, or is anchored
 * to a phrase that only occurs in the service sense. Widen it only after
 * re-running the corpus check in normalize.test.ts.
 */
const NON_PROFESSIONAL_PATTERNS: RegExp[] = [
  // Sport & athletics
  /\b(coach|coaches|coaching)\b/i,
  /\b(football|basketball|baseball|soccer|hockey|lacrosse|volleyball|caddie)\b/i,
  /\b(athletic trainer|strength and conditioning|equipment manager)\b/i,
  // Food service
  /\b(barista|bartender|chef|line cook|culinary|kitchen|dishwasher|waitstaff|waiter|waitress|food service|restaurant crew)\b/i,
  // Retail, warehouse & manual trades
  /\b(cashier|retail associate|sales associate|store associate|stocker|merchandiser)\b/i,
  /\b(warehouse|forklift|delivery driver|courier|package handler)\b/i,
  /\b(janitor|custodian|housekeep\w*|groundskeep\w*|landscap\w*)\b/i,
  /\b(welder|plumber|electrician|carpenter|roofer)\b/i,
  // Personal & care services
  /\b(nurse|nursing|caregiver|caretaker|home health|patient care|phlebotom\w*|dental assistant|veterinary)\b/i,
  /\b(massage|cosmetolog\w*|barber|salon|esthetician|nail technician)\b/i,
  // Security, transport, hospitality
  /\b(security guard|lifeguard|flight attendant|bus driver|valet|bellhop)\b/i,
  // Education support & seasonal
  /\b(camp counselor|camp counsellor|childcare|babysitt\w*|daycare|substitute teacher)\b/i,
]

/**
 * Terms that mark a posting as a professional desk role regardless of anything
 * else in the title.
 *
 * This override exists because the blocklist alone is far too blunt. Measured
 * against the real corpus, a blocklist on its own threw out "Data Warehouse
 * Intern", "Hockey Analytics Intern", "Baseball Operations R&D Intern",
 * "Research Intern - AI for Nursing" and "Software Engineering Intern -
 * Warehouse Operations" — every one of them a desk job that merely *mentions*
 * a domain. Two thirds of its rejections were wrong.
 *
 * A sports team hiring an analyst is hiring an analyst. The discipline in the
 * title is a stronger signal than the industry it serves, so it wins.
 */
// Note the trailing `\w*` on anything that pluralises or inflects: a bare
// `analytic` never matches "Analytics", because `\b` requires a non-word
// character straight after. That exact slip let "Hockey Analytics Intern"
// through to the blocklist on the first pass.
const PROFESSIONAL_SIGNALS =
  /\b(software|engineer\w*|developer|programm\w*|comput\w*|data|analytic\w*|analyst\w*|analysis|research\w*|scientist\w*|science|machine learning|ai|ml|quant\w*|statistic\w*|actuarial|product manage\w*|product market\w*|marketing|financ\w*|accounting|audit\w*|consult\w*|strategy|legal|counsel|design\w*|ux|ui|security|cyber\w*|network\w*|cloud|devops|infrastructure|platform\w*|database\w*|firmware|hardware|electrical|mechanical|robotic\w*|aerospace|chemical|biomedical|r&d|business intelligence|it|information system\w*|supply chain|operations research)\b/i

/**
 * Whether a posting is a professional/desk role worth listing on this board.
 *
 * Runs after the early-careers check, so it only ever sees intern/new-grad
 * postings and never has to reason about senior titles.
 *
 * A professional signal wins over the blocklist. That ordering is the whole
 * design: it is far worse to drop a real software internship because the team
 * happens to serve a kitchen or a hockey rink than to let the occasional
 * genuine service role through.
 */
export function isProfessionalRole(title: string): boolean {
  if (PROFESSIONAL_SIGNALS.test(title)) return true
  return !NON_PROFESSIONAL_PATTERNS.some((pattern) => pattern.test(title))
}

const REGION_RULES: { pattern: RegExp; region: Region }[] = [
  { pattern: /\b(remote|anywhere|distributed|work from home|wfh)\b/i, region: 'Remote' },
  {
    pattern:
      /\b(united kingdom|uk|england|scotland|wales|london|manchester|edinburgh|cambridge|bristol|leeds|birmingham)\b/i,
    region: 'United Kingdom',
  },
  {
    pattern:
      /\b(canada|ontario|quebec|british columbia|alberta|toronto|vancouver|montreal|ottawa|waterloo|calgary|\bon\b|\bbc\b|\bqc\b)\b/i,
    region: 'Canada',
  },
]

/**
 * Map a free-text location onto one of the four regions Browse filters by.
 *
 * Remote is checked first: a "Remote - Canada" posting is more useful to a
 * candidate as Remote than as Canada, and it is how the filter reads.
 */
export function classifyRegion(location: string, remoteHint?: boolean): Region {
  if (remoteHint) return 'Remote'
  for (const rule of REGION_RULES) {
    if (rule.pattern.test(location)) return rule.region
  }
  // Everything else falls back to the US, which is where the bulk of the
  // early-careers market these providers cover actually sits.
  return 'United States'
}

export function classifyWorkModel(location: string, description: string): WorkModel {
  if (/\bhybrid\b/i.test(location) || /\bhybrid\b/i.test(description)) return 'Hybrid'
  if (/\b(remote|work from home|distributed)\b/i.test(location)) return 'Remote'
  return 'On-site'
}

/**
 * What the posting says about visa sponsorship.
 *
 * Negative phrasing is checked first and wins, because "we are unable to
 * sponsor" contains the word "sponsor" and would otherwise read as a yes.
 *
 * Silence returns 'unknown', not 'no'. Most postings never mention sponsorship
 * at all, and recording that as "does not sponsor" invents a rejection the
 * employer never issued — which is exactly the thing this product exists to get
 * right. An honest "not stated" is more useful to a candidate than a confident
 * wrong answer in either direction.
 */
export function detectSponsorship(text: string): Sponsorship {
  const negative =
    /\b(no|not|unable to|cannot|can'?t|do(es)? not|will not|won'?t)\b[^.]{0,40}\b(sponsor|sponsorship|visa)\b/i
  if (negative.test(text)) return 'no'

  const positive =
    /\b(sponsor(ship)?\s+(is\s+)?(available|offered|provided)|will sponsor|we sponsor|visa sponsorship|h-?1b sponsor|sponsor(s|ing)? (work )?visas?)\b/i
  return positive.test(text) ? 'yes' : 'unknown'
}

/** Skills the UI shows as chips and the recommender matches against. */
const SKILL_VOCABULARY = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'Swift',
  'Kotlin', 'Scala', 'PHP', 'R', 'MATLAB', 'SQL', 'NoSQL', 'React', 'Angular', 'Vue',
  'Next.js', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Rails', '.NET',
  'GraphQL', 'REST', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Azure', 'GCP',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'Spark', 'Hadoop', 'Airflow',
  'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'scikit-learn', 'Machine Learning',
  'Deep Learning', 'NLP', 'Computer Vision', 'Data Analysis', 'Git', 'CI/CD', 'Linux',
  'HTML', 'CSS', 'Tailwind', 'Figma', 'Agile', 'Testing',
]

/**
 * Pull known skills out of the posting body.
 *
 * A fixed vocabulary rather than free extraction: the chips are only useful if
 * they match the vocabulary the resume matcher already uses, and an open-ended
 * extractor produces noise like "team player" that no one can filter on.
 */
export function extractSkills(text: string, limit = 8): string[] {
  const found: string[] = []
  for (const skill of SKILL_VOCABULARY) {
    // Escape regex metacharacters in entries like "C++" and ".NET".
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // `\b` only works when the term starts with a word character, so entries
    // like ".NET" opt out of it.
    const boundary = /^[a-z0-9]/i.test(skill) ? '\\b' : ''
    // The trailing guard stops a short term matching inside a longer one —
    // "Git" inside "Gitlab", "C" inside "C++", "Node" inside "Node.js". A dot
    // only counts as part of the term when a letter or digit follows it, so a
    // skill ending a sentence ("...and React.") still matches.
    //
    // Very short names are matched case-sensitively. Case-insensitively, "R"
    // hits the pronoun-sized noise in any prose and "Go" hits the English verb,
    // which put bogus chips on postings that mention neither language.
    const flags = skill.length <= 2 ? '' : 'i'
    if (new RegExp(`${boundary}${escaped}(?![a-z0-9+#]|\\.[a-z0-9])`, flags).test(text)) {
      found.push(skill)
      if (found.length >= limit) break
    }
  }
  return found
}

/* -------------------------------------------------------------------------- */
/* Identity                                                                   */
/* -------------------------------------------------------------------------- */

function sha1(value: string): string {
  return createHash('sha1').update(value).digest('hex')
}

/**
 * Cross-provider identity for a posting.
 *
 * Company, title and region — not the raw location string, because one provider
 * says "Seattle, WA" where another says "Seattle, Washington, United States"
 * for the same opening, and a fingerprint that disagrees on those would let the
 * duplicate through. Region is coarse enough to survive that while still
 * keeping genuinely different offices apart.
 */
export function fingerprintOf(company: string, title: string, region: Region): string {
  return sha1(`${identityKey(company)}|${identityKey(title)}|${region}`)
}

/** Hash of the fields worth rewriting a row for. */
export function contentHashOf(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'contentHash'>) {
  return sha1(
    [
      job.title,
      job.company,
      job.loc,
      job.type,
      job.region,
      job.workModel,
      job.sponsorship,
      job.skills.join(','),
      job.description,
      job.applyUrl,
      job.postedAt,
    ].join('|'),
  )
}

/* -------------------------------------------------------------------------- */
/* Entry point                                                                */
/* -------------------------------------------------------------------------- */

export type NormalizedJob = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Trim a field to a sane display length.
 *
 * The database columns are TEXT so nothing here is required for the insert to
 * succeed; this is about the UI. A location listing fifteen offices makes a
 * table row unreadable, so it is cut with an ellipsis rather than stored whole.
 */
function clamp(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`
}

/**
 * Normalise one raw posting, or return null to reject it.
 *
 * Rejection is not an error: most of what these feeds carry is senior roles
 * RoleVault doesn't list, so the caller counts skips rather than logging them.
 */
export function normalizeJob(raw: RawJob, source: string): NormalizedJob | null {
  const title = raw.title?.trim()
  const company = raw.company?.trim()
  if (!title || !company || !raw.applyUrl) return null

  const type = classifyJobType(title, raw.employmentTypeHint)
  if (type === null) return null

  // Early-careers, but not a desk role — e.g. "Football Coaches Intern", which
  // the upstream feed files under AI/ML/Data.
  if (!isProfessionalRole(title)) return null

  const description = htmlToText(raw.description ?? '')
  const location = raw.location?.trim() || 'Not specified'
  const region = classifyRegion(location, raw.remoteHint)

  const base = {
    title: clamp(title, 200),
    company: clamp(company, 150),
    loc: clamp(location, 150),
    type,
    region,
    workModel: classifyWorkModel(location, description),
    // A source that records sponsorship as a field beats inferring it from
    // prose, so an explicit hint wins. Otherwise read the description, which
    // returns 'unknown' when it stays silent.
    sponsorship: raw.sponsorshipHint ?? detectSponsorship(`${title}\n${description}`),
    skills: extractSkills(description),
    description,
    applyUrl: raw.applyUrl,
    // Sources that omit a date are treated as posted now; sorting by recency is
    // still more useful than dropping them or parking them at the epoch.
    postedAt: raw.postedAt ?? new Date().toISOString(),
    applied: 0,
    source,
    externalId: raw.externalId,
    fingerprint: fingerprintOf(company, title, region),
  }

  return { ...base, contentHash: contentHashOf(base) }
}
