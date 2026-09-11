export default function AdminProfile() {
  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Admin Profile</h3>
            <p className="section-meta">
              Manage your account settings.
            </p>
          </div>
        </div>
      </section>
      
      <section className="active-section">
        <div className="card wide" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>Profile settings mock view.</h3>
        </div>
      </section>
    </div>
  )
}

