/**
 * Seed dataset for the job board.
 *
 * Used by the in-memory repository, which is the default so the app runs with
 * no database. Once ingestion has populated Postgres this is only a
 * development convenience — real listings come from `src/ingest`.
 *
 * Rows are built through the same `fingerprint`/`contentHash` helpers the
 * pipeline uses, so the in-memory repository de-duplicates against seed data
 * exactly as the SQL one does against stored rows.
 */

import type { Job, JobType, Region, Sponsorship, WorkModel } from '../models/job'
import { contentHashOf, fingerprintOf } from '../ingest/normalize'

const HOUR = 60 * 60 * 1000

interface SeedSpec {
  hoursAgo: number
  title: string
  company: string
  loc: string
  type: JobType
  region: Region
  workModel: WorkModel
  sponsorship: Sponsorship
  skills: string[]
  applied: number
  description: string
}

function makeJob(index: number, spec: SeedSpec): Job {
  const postedAt = new Date(Date.now() - spec.hoursAgo * HOUR).toISOString()
  const base = {
    title: spec.title,
    company: spec.company,
    loc: spec.loc,
    type: spec.type,
    region: spec.region,
    workModel: spec.workModel,
    sponsorship: spec.sponsorship,
    skills: spec.skills,
    description: spec.description,
    applyUrl: `https://example.com/apply/${index}`,
    postedAt,
    applied: spec.applied,
    source: 'seed',
    externalId: `seed-${index}`,
    fingerprint: fingerprintOf(spec.company, spec.title, spec.region),
  }
  return {
    ...base,
    contentHash: contentHashOf(base),
    id: `job_seed_${index}`,
    createdAt: postedAt,
    updatedAt: postedAt,
  }
}

function body(role: string, company: string, intro: string): string {
  return [
    `${company} is hiring a ${role}.`,
    '',
    'About the role',
    intro,
    '',
    'What you will do',
    '• Ship production code alongside senior engineers from your first weeks.',
    '• Own a scoped project end to end, with design review and mentorship.',
    '• Take part in code review, on-call shadowing, and team planning.',
    '',
    'What we look for',
    '• Currently pursuing or recently completed a degree in a technical field.',
    '• Coursework or project experience in the technologies listed above.',
    '• Clear written communication — much of our work happens in docs and PRs.',
  ].join('\n')
}

const SPECS: SeedSpec[] = [
  {
    hoursAgo: 2, title: 'Software Engineer Intern', company: 'Acme Labs',
    loc: 'San Francisco, US', type: 'Internship', region: 'United States',
    workModel: 'Hybrid', sponsorship: 'yes', applied: 102,
    skills: ['Python', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
    description: body('Software Engineer Intern', 'Acme Labs',
      'You will join the developer tooling group building internal APIs in Python and Node.js. Visa sponsorship is available for full-time conversion.'),
  },
  {
    hoursAgo: 5, title: 'Frontend Intern', company: 'Nimbus',
    loc: 'London, UK', type: 'Internship', region: 'United Kingdom',
    workModel: 'On-site', sponsorship: 'yes', applied: 64,
    skills: ['TypeScript', 'React', 'CSS', 'Testing'],
    description: body('Frontend Intern', 'Nimbus',
      'Work on the customer dashboard in React and TypeScript. We sponsor visas for graduates who convert to full-time.'),
  },
  {
    hoursAgo: 9, title: 'Backend Intern', company: 'Northwind',
    loc: 'Waterloo, CA', type: 'Internship', region: 'Canada',
    workModel: 'Hybrid', sponsorship: 'no', applied: 88,
    skills: ['Java', 'Spring', 'SQL', 'Kafka'],
    description: body('Backend Intern', 'Northwind',
      'Join the payments platform team working in Java and Spring. We are unable to sponsor visas for this position.'),
  },
  {
    hoursAgo: 14, title: 'Data Engineer Co-op', company: 'Forge',
    loc: 'Toronto, CA', type: 'Co-op', region: 'Canada',
    workModel: 'On-site', sponsorship: 'no', applied: 41,
    skills: ['Python', 'Spark', 'Airflow', 'SQL', 'AWS'],
    description: body('Data Engineer Co-op', 'Forge',
      'A four-month co-op building batch pipelines with Spark and Airflow on AWS.'),
  },
  {
    hoursAgo: 20, title: 'Machine Learning Intern', company: 'Quanta AI',
    loc: 'Remote', type: 'Internship', region: 'Remote',
    workModel: 'Remote', sponsorship: 'yes', applied: 210,
    skills: ['Python', 'PyTorch', 'Machine Learning', 'NLP', 'Docker'],
    description: body('Machine Learning Intern', 'Quanta AI',
      'Fully remote. You will train and evaluate retrieval models in PyTorch. Visa sponsorship is offered for eligible candidates.'),
  },
  {
    hoursAgo: 26, title: 'New Grad Software Engineer', company: 'Vertex',
    loc: 'Austin, US', type: 'New Grad', region: 'United States',
    workModel: 'Hybrid', sponsorship: 'yes', applied: 156,
    skills: ['Go', 'Kubernetes', 'Terraform', 'GCP', 'CI/CD'],
    description: body('New Grad Software Engineer', 'Vertex',
      'Infrastructure team, writing Go services on Kubernetes. H-1B sponsorship available.'),
  },
  {
    hoursAgo: 33, title: 'Site Reliability Intern', company: 'Halcyon',
    loc: 'Seattle, US', type: 'Internship', region: 'United States',
    workModel: 'On-site', sponsorship: 'no', applied: 47,
    skills: ['Linux', 'Kubernetes', 'Python', 'CI/CD'],
    description: body('Site Reliability Intern', 'Halcyon',
      'Improve observability and deployment tooling. This role does not offer visa sponsorship.'),
  },
  {
    hoursAgo: 40, title: 'Mobile Engineering Intern', company: 'Lumen',
    loc: 'Remote', type: 'Internship', region: 'Remote',
    workModel: 'Remote', sponsorship: 'no', applied: 73,
    skills: ['Kotlin', 'Swift', 'REST', 'Git'],
    description: body('Mobile Engineering Intern', 'Lumen',
      'Build features across our Android and iOS clients.'),
  },
  {
    hoursAgo: 52, title: 'Graduate Software Developer', company: 'Beacon',
    loc: 'Manchester, UK', type: 'New Grad', region: 'United Kingdom',
    workModel: 'Hybrid', sponsorship: 'yes', applied: 119,
    skills: ['C#', '.NET', 'Azure', 'SQL'],
    description: body('Graduate Software Developer', 'Beacon',
      'Two-year graduate scheme across our .NET services. Sponsorship is available.'),
  },
  {
    hoursAgo: 61, title: 'Data Science Intern', company: 'Aperture',
    loc: 'New York, US', type: 'Internship', region: 'United States',
    workModel: 'Hybrid', sponsorship: 'no', applied: 188,
    skills: ['Python', 'Pandas', 'scikit-learn', 'SQL', 'Data Analysis'],
    description: body('Data Science Intern', 'Aperture',
      'Analyse product telemetry and build forecasting models. We cannot sponsor visas for interns.'),
  },
  {
    hoursAgo: 70, title: 'Platform Engineering Co-op', company: 'Vela',
    loc: 'Vancouver, CA', type: 'Co-op', region: 'Canada',
    workModel: 'Remote', sponsorship: 'no', applied: 35,
    skills: ['Rust', 'Docker', 'GraphQL', 'PostgreSQL'],
    description: body('Platform Engineering Co-op', 'Vela',
      'Eight-month co-op on the core platform, mostly Rust and GraphQL.'),
  },
  {
    hoursAgo: 84, title: 'Security Engineering Intern', company: 'Synthesis',
    loc: 'Remote', type: 'Internship', region: 'Remote',
    workModel: 'Remote', sponsorship: 'yes', applied: 58,
    skills: ['Python', 'Linux', 'AWS', 'Testing'],
    description: body('Security Engineering Intern', 'Synthesis',
      'Application security team. Remote-first, and we sponsor work visas.'),
  },
]

export const seedJobs: Job[] = SPECS.map((spec, index) => makeJob(index + 1, spec))
