/**
 * Seed dataset for the job board.
 *
 * Used by the in-memory repository (default in development) and by the SQL
 * seed routine. The data is intentionally "RoleVault"-flavoured: early-career
 * roles, a mix of employment types, and a `Visa sponsorship` tag on the roles
 * that sponsor — the client surfaces that tag as a sponsorship badge.
 */

import type { Job } from '../models/job'

const HOUR = 60 * 60 * 1000

/** Build a job, deriving timestamps from "hours ago" so the feed looks fresh. */
function makeJob(
  hoursAgo: number,
  data: Omit<Job, 'createdAt' | 'updatedAt'>,
): Job {
  const created = new Date(Date.now() - hoursAgo * HOUR).toISOString()
  return { ...data, createdAt: created, updatedAt: created }
}

export const seedJobs: Job[] = [
  makeJob(2, {
    id: 'job_acme_swe_intern',
    title: 'Software Engineer Intern',
    company: 'Acme Labs',
    location: 'San Francisco, US',
    remote: false,
    employmentType: 'internship',
    description:
      'Join Acme Labs to build internal tooling and APIs in Python and Node.js. ' +
      'You will ship production code within your first weeks, pair with senior ' +
      'engineers, and own a small project by end of term. A strong fit for ' +
      'students with backend coursework or a prior internship.',
    tags: ['Python', 'Node.js', 'SQL', 'Git', 'Visa sponsorship'],
    salaryMin: 8000,
    salaryMax: 9500,
    currency: 'USD',
    status: 'open',
  }),
  makeJob(3, {
    id: 'job_forge_backend_intern',
    title: 'Back-end Engineer Intern',
    company: 'Forge',
    location: 'New York, US',
    remote: false,
    employmentType: 'internship',
    description:
      'Work on Forge’s data platform building reliable services in Go and ' +
      'Python. Expect real ownership of an ingestion pipeline and close ' +
      'mentorship from the platform team.',
    tags: ['Go', 'Python', 'SQL', 'Docker'],
    salaryMin: 7500,
    salaryMax: 9000,
    currency: 'USD',
    status: 'open',
  }),
  makeJob(5, {
    id: 'job_quanta_ml_intern',
    title: 'Machine Learning Intern',
    company: 'Quanta AI',
    location: 'London, UK',
    remote: false,
    employmentType: 'internship',
    description:
      'Help train and evaluate models powering Quanta AI’s recommendation ' +
      'stack. You will work with PyTorch, run experiments, and present results ' +
      'to the research team.',
    tags: ['Python', 'PyTorch', 'Machine Learning', 'Visa sponsorship'],
    salaryMin: 3500,
    salaryMax: 4200,
    currency: 'GBP',
    status: 'open',
  }),
  makeJob(6, {
    id: 'job_acme_newgrad_swe',
    title: 'New Grad Software Engineer',
    company: 'Acme Labs',
    location: 'Remote, CA',
    remote: true,
    employmentType: 'full-time',
    description:
      'A full-time new-grad role on Acme’s developer-tools team. Build features ' +
      'across the stack in TypeScript and Go with a structured onboarding and ' +
      'return-offer track record.',
    tags: ['TypeScript', 'Go', 'React', 'PostgreSQL'],
    salaryMin: 110000,
    salaryMax: 135000,
    currency: 'CAD',
    status: 'open',
  }),
  makeJob(8, {
    id: 'job_beacon_data_intern',
    title: 'Data Analyst Intern',
    company: 'Beacon',
    location: 'Austin, US',
    remote: false,
    employmentType: 'internship',
    description:
      'Support Beacon’s analytics team with SQL reporting, dashboards, and ' +
      'ad-hoc analysis. Great for students who love turning data into clear ' +
      'stories for the business.',
    tags: ['SQL', 'Python', 'Tableau', 'Visa sponsorship'],
    salaryMin: 6000,
    salaryMax: 7000,
    currency: 'USD',
    status: 'open',
  }),
  makeJob(11, {
    id: 'job_lumen_frontend_intern',
    title: 'Frontend Engineer Intern',
    company: 'Lumen',
    location: 'Toronto, CA',
    remote: false,
    employmentType: 'internship',
    description:
      'Build polished UI for Lumen’s customer dashboard in React and ' +
      'TypeScript. You will work closely with design and ship user-facing ' +
      'features every sprint.',
    tags: ['React', 'TypeScript', 'CSS', 'Vite'],
    salaryMin: 6500,
    salaryMax: 7500,
    currency: 'CAD',
    status: 'open',
  }),
  makeJob(14, {
    id: 'job_northwind_platform_intern',
    title: 'Platform Engineer Intern',
    company: 'Northwind',
    location: 'Seattle, US',
    remote: false,
    employmentType: 'internship',
    description:
      'Help Northwind’s platform team improve CI/CD and observability. You will ' +
      'write tooling in Go, work with Kubernetes, and learn how large systems ' +
      'are operated.',
    tags: ['Go', 'Kubernetes', 'CI/CD', 'Visa sponsorship'],
    salaryMin: 8500,
    salaryMax: 10000,
    currency: 'USD',
    status: 'open',
  }),
  makeJob(20, {
    id: 'job_vela_mobile_intern',
    title: 'Mobile Engineer Intern',
    company: 'Vela',
    location: 'Vancouver, CA',
    remote: false,
    employmentType: 'internship',
    description:
      'Work on Vela’s React Native app, shipping features to thousands of ' +
      'users. A good fit for students comfortable with mobile or cross-platform ' +
      'development.',
    tags: ['React Native', 'TypeScript', 'iOS', 'Android'],
    salaryMin: 6000,
    salaryMax: 7200,
    currency: 'CAD',
    status: 'open',
  }),
  makeJob(28, {
    id: 'job_halcyon_newgrad_data',
    title: 'New Grad Data Scientist',
    company: 'Halcyon',
    location: 'Remote, US',
    remote: true,
    employmentType: 'full-time',
    description:
      'Join Halcyon as a new-grad data scientist working on forecasting and ' +
      'experimentation. Strong SQL and Python expected; experience with ' +
      'statistics is a plus.',
    tags: ['Python', 'SQL', 'Statistics', 'Visa sponsorship'],
    salaryMin: 105000,
    salaryMax: 128000,
    currency: 'USD',
    status: 'open',
  }),
  makeJob(2 * 24, {
    id: 'job_forge_devops_coop',
    title: 'DevOps Co-op',
    company: 'Forge',
    location: 'Remote, CA',
    remote: true,
    employmentType: 'contract',
    description:
      'An eight-month co-op on Forge’s infrastructure team. Automate ' +
      'deployments, improve monitoring, and help keep services reliable.',
    tags: ['Terraform', 'AWS', 'Docker', 'Linux'],
    salaryMin: 7000,
    salaryMax: 8000,
    currency: 'CAD',
    status: 'open',
  }),
  makeJob(3 * 24, {
    id: 'job_beacon_pm_intern',
    title: 'Product Analyst Intern',
    company: 'Beacon',
    location: 'New York, US',
    remote: false,
    employmentType: 'internship',
    description:
      'Partner with product managers to size opportunities, analyse funnels, ' +
      'and inform roadmap decisions. SQL fluency and curiosity required.',
    tags: ['SQL', 'Analytics', 'Product'],
    salaryMin: 6500,
    salaryMax: 7500,
    currency: 'USD',
    status: 'closed',
  }),
  makeJob(4 * 24, {
    id: 'job_lumen_design_intern',
    title: 'Design Engineer Intern',
    company: 'Lumen',
    location: 'Toronto, CA',
    remote: false,
    employmentType: 'internship',
    description:
      'A hybrid design-and-code role building the Lumen design system in React. ' +
      'Bridge Figma and production components.',
    tags: ['React', 'Design Systems', 'Figma', 'CSS'],
    salaryMin: 6500,
    salaryMax: 7500,
    currency: 'CAD',
    status: 'draft',
  }),
]
