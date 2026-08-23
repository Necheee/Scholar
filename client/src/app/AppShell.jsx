import { NavLink } from 'react-router-dom'

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
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">Project workspace</p>
            <h2>{config.name} dashboard</h2>
          </div>
          <button type="button" className="primary-button">
            Create {config.name === 'Student' ? 'Application' : config.name === 'Sponsor' ? 'Opportunity' : 'Review'}
          </button>
        </header>

        <section className="content-grid">
          <div className="card">
            <h3>Current status</h3>
            <p>Application workflow and role-based navigation are ready for the next feature layer.</p>
          </div>
          <div className="card">
            <h3>Design system</h3>
            <p>Warm neutrals, dark brown surfaces, and careful spacing are aligned to the project brief.</p>
          </div>
          <div className="card wide">
            <h3>Implementation focus</h3>
            <p>
              Phase 1 establishes the shell, shared UI tokens, and route structure so the student,
              sponsor, and admin interfaces can be developed incrementally without architectural drift.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
