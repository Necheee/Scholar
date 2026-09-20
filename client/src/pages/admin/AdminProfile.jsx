import { useAuth } from '../../hooks/useAuth'

export default function AdminProfile() {
  const { user } = useAuth()

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
          </div>
        </div>
        <div className="profile-title">
          <h2>{user?.name || 'System Admin'}</h2>
          <p className="profile-meta">Administrator • System Access</p>
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-section card">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Name</span>
              <span className="value">{user?.name || 'System Admin'}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{user?.email || 'admin@scholar.edu'}</span>
            </div>
            <div className="info-item">
              <span className="label">Role</span>
              <span className="value">{user?.role || 'Admin'}</span>
            </div>
            <div className="info-item">
              <span className="label">Status</span>
              <span className="value" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Active</span>
            </div>
          </div>
        </section>
        
        <section className="profile-section card">
          <h3>Account & Security</h3>
          <div className="settings-list">
            <button type="button" className="settings-item" onClick={() => alert('This feature is currently in development and will be available soon!')}>
              <span>Change Password</span>
              <span className="arrow">→</span>
            </button>
            <button type="button" className="settings-item" onClick={() => alert('This feature is currently in development and will be available soon!')}>
              <span>Two-Factor Authentication</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

