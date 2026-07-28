import type { Job } from '../../types/job'

export const featuredHomeJobs: Job[] = []

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

export function computeRecommendations(skills: string[], jobs: Job[] = []) {
	if (!skills || skills.length === 0 || !jobs || jobs.length === 0) {
		return [] as Array<{ job: Job; score: number; matches: string[] }>
	}
	const scored = jobs.map((job) => {
		// match against position and location
		const text = `${job.position} ${job.jobLocation}`.toLowerCase()
		const matches = skills.filter((skill) => text.includes(skill.toLowerCase()))
		return { job, score: Math.round((matches.length / Math.max(1, skills.length)) * 100), matches }
	})
	return scored.sort((a, b) => b.score - a.score).slice(0, 5)
}
