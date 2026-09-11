export default function AdminNotifications() {
  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Admin Notifications</h3>
            <p className="section-meta">
              Your alerts and messages.
            </p>
          </div>
        </div>
      </section>
      
      <section className="active-section">
        <div className="card wide" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>You have no new notifications.</h3>
        </div>
      </section>
    </div>
  )
}
