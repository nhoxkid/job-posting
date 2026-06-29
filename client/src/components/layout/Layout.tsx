import { Outlet } from 'react-router-dom'
import { RvNav } from './RvNav'
import { usePalette } from '../../lib/palette'

/** Shell for the in-app RoleVault screens: sticky nav + routed content. */
export function Layout() {
  const p = usePalette()
  return (
    <div
      style={{
        background: p.pageBg,
        minHeight: '100vh',
        animation: 'spr-up .35s ease both',
        transition: 'background .2s',
      }}
    >
      <RvNav />
      <Outlet />
    </div>
  )
}
