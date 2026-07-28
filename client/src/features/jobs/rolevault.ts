import type { Job } from '../../types/job'

/**
 * The handful of postings the landing page features.
 *
 * Takes the board as an argument rather than reading a module-level dataset:
 * jobs now arrive asynchronously from the API, so there is nothing to read at
 * import time. Newest first — a stale posting is a poor advertisement.
 */
export function pickFeaturedJobs(jobs: Job[], count = 6): Job[] {
	return [...jobs]
		.sort((a, b) => b.postedAt.localeCompare(a.postedAt))
		.slice(0, count)
}

/** Company initials for the avatar tiles, e.g. "Acme Labs" -> "AL". */
export function companyInitials(company: string): string {
	return company
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((word) => word[0]?.toUpperCase() ?? '')
		.join('')
}

const resumeSkillPatterns: Array<{ label: string; pattern: RegExp }> = [
	{ label: 'Python', pattern: /\bpython\b/i },
	{ label: 'JavaScript', pattern: /\bjavascript\b/i },
	{ label: 'TypeScript', pattern: /\btypescript\b/i },
	{ label: 'React', pattern: /\breact\b/i },
	{ label: 'Node.js', pattern: /\bnode(?:\.js)?\b/i },
	{ label: 'SQL', pattern: /\bsql\b/i },
	{ label: 'NoSQL', pattern: /\bnosql\b/i },
	{ label: 'Git', pattern: /\bgit\b/i },
	{ label: 'Docker', pattern: /\bdocker\b/i },
	{ label: 'Kubernetes', pattern: /\bkubernetes\b/i },
	{ label: 'TensorFlow', pattern: /\btensorflow\b/i },
	{ label: 'PyTorch', pattern: /\bpytorch\b/i },
	{ label: 'C++', pattern: /\bc\+\+\b/i },
	{ label: 'C', pattern: /\bc\b/i },
	{ label: 'Embedded C', pattern: /embedded\s+c/i },
	{ label: 'Networking', pattern: /\bnetwork(?:ing)?\b/i },
	{ label: 'Bash', pattern: /\bbash\b/i },
	{ label: 'AWS', pattern: /\baws\b/i },
	{ label: 'GCP', pattern: /\bgcp\b/i },
	{ label: 'Linux', pattern: /\blinux\b/i },
	{ label: 'Rust', pattern: /\brust\b/i },
]

export function readDetectedSkills(): string[] {
	return JSON.parse(window.localStorage.getItem('rv-detected-skills') || 'null') || []
}

export function readResumeName(): string | null {
	return window.localStorage.getItem('rv-resume-name')
}

export function parseResumeSkills(content: string, fileName?: string) {
	const searchable = `${fileName || ''}\n${content}`
	return resumeSkillPatterns
		.filter(({ pattern }) => pattern.test(searchable))
		.map(({ label }) => label)
		.filter((label, index, all) => all.indexOf(label) === index)
}

export function inferResumeSkills(content: string, fileName?: string, directSkills: string[] = []) {
	const searchable = `${fileName || ''}\n${content}`.toLowerCase()
	const inferredGroups = [
		{ when: /backend|api|server|rest|express|node/i, add: ['Node.js', 'SQL'] },
		{ when: /frontend|web|ui|react|typescript|javascript/i, add: ['React', 'TypeScript', 'JavaScript'] },
		{ when: /ml|machine learning|data science|analytics|model|neural/i, add: ['Python', 'TensorFlow', 'PyTorch', 'SQL'] },
		{ when: /cloud|devops|infrastructure|kubernetes|docker|aws|gcp/i, add: ['Docker', 'Kubernetes', 'AWS'] },
		{ when: /embedded|firmware|systems|hardware|network/i, add: ['C', 'C++', 'Linux', 'Networking'] },
	]
	const inferred = inferredGroups.flatMap((group) => (group.when.test(searchable) ? group.add : []))
	const prioritySkills = ['Python', 'React', 'TypeScript', 'JavaScript', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS', 'Linux']
	const merged = [...directSkills, ...inferred]
	for (const skill of prioritySkills) {
		if (merged.length >= 5) break
		if (!merged.includes(skill)) merged.push(skill)
	}
	return merged.filter((label, index, all) => all.indexOf(label) === index).slice(0, 5)
}

export async function readFileAsText(file: File) {
	const buffer = await file.arrayBuffer()
	return new TextDecoder('latin1').decode(buffer)
}

export interface Recommendation {
	job: Job
	score: number
	matches: string[]
}

/**
 * Rank the board against the skills detected in a resume.
 *
 * Postings with no overlap are dropped rather than shown at 0% — a
 * "recommendation" that matches nothing is noise, and the empty state is more
 * honest when the resume genuinely doesn't fit anything on the board.
 */
export function computeRecommendations(skills: string[], jobs: Job[]): Recommendation[] {
	if (!skills?.length || !jobs.length) return []

	return jobs
		.map((job) => {
			const matches = job.skills.filter((skill) => skills.includes(skill))
			return {
				job,
				score: Math.round((matches.length / Math.max(1, job.skills.length)) * 100),
				matches,
			}
		})
		.filter((entry) => entry.matches.length > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, 5)
}
