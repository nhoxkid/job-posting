import { useEffect, useRef, useState } from 'react'
import { Logo } from '../../../components/layout/RoleVaultChrome'
import { inferResumeSkills, parseResumeSkills, readDetectedSkills, readFileAsText, readResumeName } from '../../jobs/rolevault'
import type { RoleVaultScreen } from '../types'

export type OnboardingScreenProps = {
	go: (s: RoleVaultScreen) => void
	setDetectedSkills: (s: string[]) => void
	setResumeName: (s: string | null) => void
}

export function OnboardingScreen({ go, setDetectedSkills, setResumeName }: OnboardingScreenProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [previewSkills, setPreviewSkills] = useState<string[]>(() => readDetectedSkills())
	const [resumeName, setResumeNameLocal] = useState<string | null>(() => readResumeName())
	const [status, setStatus] = useState<string>(() => {
		const storedResumeName = readResumeName()
		const storedSkills = readDetectedSkills()
		return storedResumeName ? `${storedSkills.length ? storedSkills.length : 0} skills detected` : 'Upload a PDF resume to detect skills.'
	})
	const [isParsing, setIsParsing] = useState(false)
	const [parseError, setParseError] = useState<string | null>(null)
	const [openPreference, setOpenPreference] = useState<'jobType' | 'regions' | 'sponsorship' | 'roles' | null>(null)
	const [preferences, setPreferences] = useState({
		jobType: 'Internship + New Grad',
		regions: 'US, CA, UK',
		sponsorship: 'Yes — required',
		roles: 'SWE, ML, Backend',
	})

	const preferenceOptions: Record<'jobType' | 'regions' | 'sponsorship' | 'roles', string[]> = {
		jobType: ['Internship + New Grad', 'Internship only', 'New Grad only', 'Co-op'],
		regions: ['US, CA, UK', 'United States', 'Canada', 'United Kingdom', 'Remote'],
		sponsorship: ['Yes — required', 'Preferred', 'Any'],
		roles: ['SWE, ML, Backend', 'Frontend', 'Data', 'Product', 'DevOps'],
	}

	useEffect(() => {
		const storedSkills = readDetectedSkills()
		const storedResumeName = readResumeName()
		setPreviewSkills(storedSkills)
		setResumeNameLocal(storedResumeName)
		setStatus(storedResumeName ? `${storedSkills.length ? storedSkills.length : 0} skills detected` : 'Upload a PDF resume to detect skills.')
	}, [])

	const persistResumeState = (skills: string[], nextResumeName: string | null) => {
		setPreviewSkills(skills)
		setDetectedSkills(skills)
		setResumeName(nextResumeName)
		setResumeNameLocal(nextResumeName)
		window.localStorage.setItem('rv-detected-skills', JSON.stringify(skills))
		if (nextResumeName) {
			window.localStorage.setItem('rv-resume-name', nextResumeName)
		} else {
			window.localStorage.removeItem('rv-resume-name')
		}
	}

	const clearResumeState = () => {
		setPreviewSkills([])
		setDetectedSkills([])
		setResumeName(null)
		setResumeNameLocal(null)
		setStatus('Upload a PDF resume to detect skills.')
		setParseError(null)
		window.localStorage.removeItem('rv-detected-skills')
		window.localStorage.removeItem('rv-resume-name')
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const processResume = async (file: File) => {
		if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
			setParseError('Please upload a PDF resume.')
			return
		}
		setIsParsing(true)
		setParseError(null)
		try {
			const rawText = await readFileAsText(file)
			const directSkills = parseResumeSkills(rawText, file.name)
			const nextSkills = inferResumeSkills(rawText, file.name, directSkills)
			persistResumeState(nextSkills, file.name)
			const inferredCount = Math.max(0, nextSkills.length - directSkills.length)
			setStatus(`${directSkills.length} direct${inferredCount ? ` + ${inferredCount} inferred` : ''} skills detected from ${file.name}`)
		} catch {
			setParseError('Unable to read the file. Try a text-based PDF resume.')
		} finally {
			setIsParsing(false)
		}
	}

	return (
		<div style={{ animation: 'spr-up .35s ease both' }}>
			<div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #ECF0EE' }}>
				<div style={{ maxWidth: 840, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div onClick={() => go('landing')} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
						<Logo />
						<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.02em' }}>RoleVault</span>
					</div>
					<button onClick={() => go('profile')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: '#15603F', background: '#fff', border: '1.5px solid #CFE0D7', borderRadius: 10, padding: '9px 18px', cursor: 'pointer' }}>My Profile</button>
				</div>
			</div>
			<div style={{ maxWidth: 840, margin: '0 auto', padding: '36px 28px 60px' }}>
				<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Upload your resume</h1>
				<p style={{ fontSize: 16, color: '#566660', margin: '0 0 28px' }}>{"We'll analyze it to rank jobs by how well they match your skills and experience."}</p>
				<div style={{ border: '2px dashed #C5DBCD', background: '#F7FBF8', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
					<div style={{ width: 54, height: 54, borderRadius: 14, background: '#EAF4EE', color: '#1A7A52', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>⇪</div>
					<div style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Drag and drop your PDF resume here</div>
					<div style={{ fontSize: 14, color: '#7A8780', marginBottom: 18 }}>PDF only, up to 5MB</div>
					<input ref={fileInputRef} type='file' accept='application/pdf,.pdf' onChange={(event) => {
						const file = event.target.files?.[0]
						if (file) {
							void processResume(file)
						}
						event.target.value = ''
					}} style={{ display: 'none' }} />
					<button onClick={() => fileInputRef.current?.click()} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: '#15603F', background: '#fff', border: '1.5px solid #CFE0D7', borderRadius: 10, padding: '10px 22px', cursor: 'pointer' }}>
						{isParsing ? 'Reading resume...' : 'Browse Files'}
					</button>
					{parseError && <div style={{ marginTop: 12, color: '#B23B32', fontSize: 13.5, fontWeight: 600 }}>{parseError}</div>}
				</div>
				<div style={{ background: '#fff', border: '1px solid #E8EDEB', borderRadius: 16, padding: 22, marginTop: 18 }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
							<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EAF4EE', color: '#15603F', fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '5px 10px', borderRadius: 999 }}><span style={{ width: 6, height: 6, background: '#1A7A52', borderRadius: '50%' }} />AI</span>
							<span style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 18 }}>Detected Skills Preview</span>
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
							<span style={{ fontSize: 13, color: '#8B988F' }}>{resumeName || 'No resume uploaded yet'}</span>
							{(resumeName || previewSkills.length > 0) && (
								<button type='button' onClick={clearResumeState} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 13, color: '#B23B32', background: '#fff', border: '1.5px solid #F0D2CF', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
									Clear resume
								</button>
							)}
						</div>
					</div>
					{previewSkills.length ? (
						<>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginBottom: 16 }}>
								{previewSkills.map((skill) => <span key={skill} style={{ fontWeight: 600, fontSize: 13.5, color: '#15603F', background: '#EAF4EE', border: '1px solid #D2E7DB', borderRadius: 9, padding: '7px 14px' }}>{skill}</span>)}
							</div>
							<div style={{ borderTop: '1px solid #ECF0EE', paddingTop: 14, fontSize: 14, color: '#46554F' }}>Status: <strong style={{ color: '#15603F' }}>{status}</strong></div>
						</>
					) : (
						<div style={{ fontSize: 14.5, color: '#7A8780' }}>Upload a PDF resume to surface skills here and unlock recommendations.</div>
					)}
				</div>
				<div style={{ background: '#fff', border: '1px solid #E8EDEB', borderRadius: 16, padding: 24, marginTop: 18 }}>
					<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', margin: '0 0 20px' }}>Preferences</h2>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
						{([
							{ key: 'jobType', label: 'Job Type' },
							{ key: 'regions', label: 'Preferred Regions' },
							{ key: 'sponsorship', label: 'Sponsorship needed?' },
							{ key: 'roles', label: 'Preferred Roles' },
						] as const).map((field) => (
							<div key={field.key} style={{ position: 'relative' }}>
								<label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>{field.label}</label>
								<button type='button' onClick={() => setOpenPreference((current) => current === field.key ? null : field.key)} style={{ width: '100%', border: '1.5px solid #E3E9E6', borderRadius: 10, padding: '12px 14px', fontSize: 14.5, color: '#10211B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
									<span>{preferences[field.key]}</span>
									<span style={{ color: '#9AA8A2' }}>▾</span>
								</button>
								{openPreference === field.key && (
									<div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 6, background: '#fff', border: '1px solid #DCE7E0', borderRadius: 12, boxShadow: '0 10px 24px rgba(16,33,27,0.08)', zIndex: 5, overflow: 'hidden' }}>
										{preferenceOptions[field.key].map((option) => (
											<button key={option} type='button' onClick={() => { setPreferences((current) => ({ ...current, [field.key]: option })); setOpenPreference(null); }} style={{ width: '100%', padding: '11px 14px', border: 'none', background: option === preferences[field.key] ? '#EAF4EE' : '#fff', color: '#10211B', textAlign: 'left', fontFamily: "'Plus Jakarta Sans'", fontSize: 14, cursor: 'pointer' }}>
												{option}
											</button>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
				<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
					<button onClick={() => go('browse')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 15, color: '#46554F', background: '#fff', border: '1.5px solid #E3E9E6', borderRadius: 11, padding: '13px 22px', cursor: 'pointer' }}>Skip for now</button>
					<button onClick={() => {
						if (!previewSkills.length) return
						persistResumeState(previewSkills, resumeName)
					}} disabled={!previewSkills.length} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: '#fff', background: !previewSkills.length ? '#9AA8A2' : '#1A7A52', border: 'none', borderRadius: 11, padding: '13px 24px', cursor: !previewSkills.length ? 'not-allowed' : 'pointer', boxShadow: '0 6px 18px rgba(26,122,82,0.25)' }}>Save resume</button>
					<button onClick={() => {
						if (!previewSkills.length) return
						persistResumeState(previewSkills, resumeName)
						go('recommended')
					}} disabled={!previewSkills.length} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 15, color: '#15603F', background: '#fff', border: '1.5px solid #CFE0D7', borderRadius: 11, padding: '13px 24px', cursor: !previewSkills.length ? 'not-allowed' : 'pointer' }}>View recommendations</button>
				</div>
			</div>
		</div>
	)
}
