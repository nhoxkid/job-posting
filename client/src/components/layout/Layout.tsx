import { Outlet } from 'react-router-dom'
import { RvNav } from './RvNav'

/** Shell for the in-app RoleVault screens: sticky nav + routed content. */
export function Layout() {
  return (
    <div style={{ background: '#F6F8F5', minHeight: '100vh', animation: 'spr-up .35s ease both' }}>
      <RvNav />
      <Outlet />
    </div>
  )
}
