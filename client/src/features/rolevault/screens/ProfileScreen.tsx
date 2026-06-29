import { useState } from 'react'
import { NavBar } from '../../../components/layout/RoleVaultChrome'
import type { RoleVaultScreen, ProfileTab } from '../types'

export type ProfileScreenProps = {
	go: (s: RoleVaultScreen) => void
	detectedSkills: string[]
	resumeName: string | null
	setDetectedSkills: (s: string[]) => void
	setResumeName: (s: string | null) => void
}

export function ProfileScreen({ go, detectedSkills, resumeName, setDetectedSkills, setResumeName }: ProfileScreenProps) {
	const [profileTab, setProfileTab] = useState<ProfileTab>('profile')
	const navItems: { key: ProfileTab; label: string }[] = [
		{ key: 'profile', label: 'Profile' }, { key: 'resume', label: 'Resume & Matching' },
		{ key: 'password', label: 'Password & Security' }, { key: 'prefs', label: 'Job Preferences' },
	]
	return (
		<div style={{ animation: 'spr-up .35s ease both' }}>
			<NavBar screen='profile' go={go} />
			<div style={{ maxWidth: 1080, margin: '0 auto', padding: 28, display: 'grid', gridTemplateColumns: '240px 1fr', gap: 28, alignItems: 'start' }}>
				<aside style={{ background: '#fff', border: '1px solid #E8EDEB', borderRadius: 16, padding: 14, position: 'sticky', top: 90 }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						{navItems.map((n) => (
							<div key={n.key} onClick={() => setProfileTab(n.key)} style={{ fontSize: 14.5, fontWeight: profileTab === n.key ? 700 : 600, color: profileTab === n.key ? '#10211B' : '#5E6E68', background: profileTab === n.key ? '#EAF4EE' : 'transparent', borderRadius: 10, padding: '11px 14px', cursor: 'pointer' }}>{n.label}</div>
						))}
					</div>
					<div style={{ borderTop: '1px solid #ECF0EE', margin: '12px 0' }} />
					<div onClick={() => setProfileTab('delete')} style={{ fontSize: 14.5, fontWeight: profileTab === 'delete' ? 700 : 600, color: profileTab === 'delete' ? '#B23B32' : '#9A4039', background: profileTab === 'delete' ? '#FBECEC' : 'transparent', borderRadius: 10, padding: '11px 14px', cursor: 'pointer' }}>Delete Account</div>
				</aside>
				<section style={{ background: '#fff', border: '1px solid #E8EDEB', borderRadius: 16, padding: '30px 32px', minHeight: 420 }}>
					{profileTab === 'profile' && (
						<>
							<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Profile</h1>
							<div style={{ fontSize: 15, color: '#7A8780', marginBottom: 30 }}>example@example.com</div>
							<h2 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 17, margin: '0 0 14px' }}>Notification Preferences</h2>
							<div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 460 }}>
								{['Email new jobs matching my filters', 'Weekly digest of top-matched roles'].map((label) => (
									<div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid #E3E9E6', borderRadius: 12, padding: '14px 16px' }}>
										<span style={{ fontSize: 14.5, color: '#10211B' }}>{label}</span>
										<span style={{ width: 38, height: 22, borderRadius: 999, background: '#1A7A52', position: 'relative', display: 'inline-block' }}><span style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} /></span>
									</div>
								))}
							</div>
						</>
					)}
					{profileTab === 'resume' && (
						<>
							<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 24px' }}>Resume &amp; Matching</h1>
							{resumeName ? (
								<div style={{ display: 'flex', alignItems: 'center', gap: 14, border: '1.5px solid #E3E9E6', borderRadius: 12, padding: 16, maxWidth: 520, marginBottom: 16 }}>
									<div style={{ width: 42, height: 42, borderRadius: 10, background: '#EAF4EE', color: '#1A7A52', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>PDF</div>
									<div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14.5 }}>{resumeName}</div><div style={{ fontSize: 13, color: '#8B988F' }}>{detectedSkills.length} skills detected</div></div>
									<span onClick={() => {
										setDetectedSkills([])
										setResumeName(null)
										window.localStorage.removeItem('rv-detected-skills')
										window.localStorage.removeItem('rv-resume-name')
									}} style={{ fontSize: 13, fontWeight: 600, color: '#B23B32', cursor: 'pointer' }}>Remove</span>
								</div>
							) : (
								<div style={{ border: '1.5px dashed #C5DBCD', background: '#F7FBF8', borderRadius: 12, padding: 18, maxWidth: 520, marginBottom: 16, color: '#566660' }}>No resume uploaded yet. Upload a PDF to start recommendations.</div>
							)}
							<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
								<button onClick={() => go('onboarding')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: '#fff', background: '#1A7A52', border: 'none', borderRadius: 10, padding: '11px 20px', cursor: 'pointer' }}>{resumeName ? 'Re-upload resume' : 'Upload resume'}</button>
								<button onClick={() => go('recommended')} style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: '#15603F', background: '#fff', border: '1.5px solid #CFE0D7', borderRadius: 10, padding: '11px 18px', cursor: 'pointer' }}>View matches</button>
							</div>
							{detectedSkills.length > 0 && (
								<div style={{ marginTop: 18 }}>
									<div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8B988F', marginBottom: 10 }}>Detected skills</div>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{detectedSkills.map((skill) => <span key={skill} style={{ fontWeight: 600, fontSize: 13.5, color: '#15603F', background: '#EAF4EE', border: '1px solid #D2E7DB', borderRadius: 9, padding: '7px 14px' }}>{skill}</span>)}</div>
								</div>
							)}
						</>
					)}
					{profileTab === 'password' && (
						<>
							<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 24px' }}>Password &amp; Security</h1>
							<div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16 }}>
								{[{ l: 'Current password', p: '••••••••' }, { l: 'New password', p: 'At least 8 characters' }].map((f) => (
									<div key={f.l}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>{f.l}</label><input type='password' placeholder={f.p} style={{ width: '100%', border: '1.5px solid #E3E9E6', borderRadius: 10, padding: '12px 14px', fontSize: 15, fontFamily: "'Plus Jakarta Sans'", outline: 'none', boxSizing: 'border-box' }} /></div>
								))}
								<button style={{ alignSelf: 'flex-start', fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: '#fff', background: '#1A7A52', border: 'none', borderRadius: 10, padding: '11px 20px', cursor: 'pointer' }}>Update password</button>
							</div>
						</>
					)}
					{profileTab === 'prefs' && (
						<>
							<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 24px' }}>Job Preferences</h1>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', maxWidth: 560 }}>
								{[{ l: 'Job Type', v: 'Internship + New Grad', d: true }, { l: 'Preferred Regions', v: 'US, CA, UK', d: false }, { l: 'Sponsorship needed?', v: 'Yes — required', d: true }, { l: 'Preferred Roles', v: 'SWE, ML, Backend', d: false }].map((p) => (
									<div key={p.l}><label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#46554F', marginBottom: 7 }}>{p.l}</label><div style={{ border: '1.5px solid #E3E9E6', borderRadius: 10, padding: '12px 14px', fontSize: 14.5, display: 'flex', justifyContent: 'space-between', cursor: p.d ? 'pointer' : 'default' }}>{p.v}{p.d && <span style={{ color: '#9AA8A2' }}>▾</span>}</div></div>
								))}
							</div>
						</>
					)}
					{profileTab === 'delete' && (
						<>
							<h1 style={{ fontFamily: "'Schibsted Grotesk'", fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', margin: '0 0 12px', color: '#B23B32' }}>Delete Account</h1>
							<p style={{ fontSize: 14.5, color: '#46554F', lineHeight: 1.6, maxWidth: 480, margin: '0 0 20px' }}>This permanently removes your account, resume, and all saved matches. This action cannot be undone.</p>
							<button style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: '#fff', background: '#B23B32', border: 'none', borderRadius: 10, padding: '11px 20px', cursor: 'pointer' }}>Delete my account</button>
						</>
					)}
					<div style={{ borderTop: '1px solid #ECF0EE', marginTop: 32, paddingTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
						<button style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 600, fontSize: 14, color: '#46554F', background: '#fff', border: '1.5px solid #E3E9E6', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>Discard Changes</button>
						<button style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 700, fontSize: 14, color: '#fff', background: '#1A7A52', border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer' }}>Save Changes</button>
					</div>
				</section>
			</div>
		</div>
	)
}
