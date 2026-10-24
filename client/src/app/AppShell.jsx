import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const roleConfig = {
  student: {
    name: 'Student',
    navItems: [
      { label: 'Dashboard', to: '/student' },
      { label: 'Sponsorships', to: '/student/sponsorships' },

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
      { label: 'Disbursement Ledger', to: '/sponsor/transactions' },
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
      { label: 'User Management', to: '/admin/users' },
      { label: 'System Report', to: '/admin/report' },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/landing')
  }

  return (
    <div className="app-shell">
      {/* Mobile Header (only visible on small screens) */}
      <div className="mobile-header">
        <div className="brand-block" style={{ marginBottom: 0 }}>
          <div className="brand-mark" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>S</div>
          <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-ink)' }}>Scholar</h1>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Backdrop for mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-close-btn-container">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="brand-block hide-on-mobile">
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
              onClick={() => setIsMobileMenuOpen(false)}
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
