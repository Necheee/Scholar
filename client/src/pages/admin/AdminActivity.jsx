export default function AdminActivity() {
  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Recent Activity</h3>
            <p className="section-meta">
              System-wide activity logs.
            </p>
          </div>
        </div>
      </section>
      
      <section className="active-section">
        <div className="card wide" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>No recent activity to display.</h3>
        </div>
      </section>
    </div>
  )
}
