import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const roleConfig = {
  student: {
    name: 'Student',
    navItems: [
      { label: 'Dashboard', to: '/student' },
      { label: 'Sponsorships', to: '/student/sponsorships' },
      { label: 'My Application', to: '/student/application' },
      { label: 'Application History', to: '/student/history' },
      { label: 'Notifications', to: '/student/notifications' },
      { label: 'Profile', to: '/student/profile' },
    ],
  },
  sponsor: {
    name: 'Sponsor',
    navItems: [
      { label: 'Dashboard', to: '/sponsor' },
      { label: 'My Sponsorships', to: '/sponsor/opportunities' },
      { label: 'Applications', to: '/sponsor/applications' },
      { label: 'Students Seeking Sponsorship', to: '/sponsor/students' },
      { label: 'Notifications', to: '/sponsor/notifications' },
      { label: 'Profile', to: '/sponsor/profile' },
    ],
  },
  admin: {
    name: 'Admin',
    navItems: [
      { label: 'Dashboard', to: '/admin' },
      { label: 'Flagged Applications', to: '/admin/flagged' },
      { label: 'Information Requests', to: '/admin/requests' },
      { label: 'Recent Activity', to: '/admin/activity' },
      { label: 'Notifications', to: '/admin/notifications' },
      { label: 'Profile', to: '/admin/profile' },
    ],
  },
}

export default function AppShell({ role = 'student' }) {
  const config = roleConfig[role] ?? roleConfig.student
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/landing')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">S</div>
          <div>
            <p className="eyebrow">Secure system</p>
            <h1>Scholar</h1>
          </div>
        </div>

        <div className="role-panel">
          <span className="role-badge">{config.name}</span>
          {user && <p className="user-email">{user.email}</p>}
        </div>

        <nav className="nav-list" aria-label="Sidebar navigation">
          {config.navItems.map(({ label, to }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {user && (
          <button className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        )}
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  )
}
