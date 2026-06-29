import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AuthPage } from './pages/AuthPage'
import { FaqPage } from './pages/FaqPage'
import { HomePage } from './pages/HomePage'
import { JobDetailPage } from './pages/JobDetailPage'
import { JobsPage } from './pages/JobsPage'
import { NewJobPage } from './pages/NewJobPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProfilePage } from './pages/ProfilePage'
import { RecommendedPage } from './pages/RecommendedPage'

export default function App() {
  return (
    <Routes>
      {/* Full-bleed screens with their own chrome. */}
      <Route index element={<HomePage />} />
      <Route path="login" element={<AuthPage mode="login" />} />
      <Route path="register" element={<AuthPage mode="register" />} />
      <Route path="jobs/:id" element={<JobDetailPage />} />

      {/* In-app screens sharing the sticky RoleVault nav. */}
      <Route element={<Layout />}>
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/new" element={<NewJobPage />} />
        <Route path="recommended" element={<RecommendedPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="faq" element={<FaqPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
