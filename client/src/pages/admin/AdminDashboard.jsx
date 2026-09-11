import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const stats = [
    { label: 'Flagged Applications', value: 12, color: 'warning' },
    { label: 'Pending Info Requests', value: 4, color: 'accent' },
    { label: 'Applications Cleared Today', value: 28, color: 'success' },
  ]

  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Admin Dashboard</h3>
            <p className="section-meta">
              Overview of system activity, fraud detection, and pending reviews.
            </p>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/admin/flagged')}
          >
            Review Flagged
          </button>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`stat-card stat-${color}`}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </section>

      <section className="active-section">
        <div className="section-header">
          <div>
            <h3>Recent Activity</h3>
            <p className="section-meta">
              System-wide events requiring your attention
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/admin/activity')}
          >
            View All Activity
          </button>
        </div>

        <div className="content-grid">
          <div className="card wide">
            <div className="card-header">
              <div>
                <h4>Application Flagged: High Risk</h4>
                <p className="card-meta">John Doe - Tech Innovators Scholarship</p>
              </div>
              <span className="badge badge-warning">Needs Review</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', margin: '8px 0 16px' }}>
              10 minutes ago
            </p>
          </div>

          <div className="card wide">
            <div className="card-header">
              <div>
                <h4>Student Responded to Request</h4>
                <p className="card-meta">Alice Smith uploaded new transcript</p>
              </div>
              <span className="badge badge-info">Update</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', margin: '8px 0 16px' }}>
              2 hours ago
            </p>
          </div>

          <div className="card wide">
            <div className="card-header">
              <div>
                <h4>Sponsor Approved Application</h4>
                <p className="card-meta">Tech Corp approved Jane Doe</p>
              </div>
              <span className="badge badge-success">Approved</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', margin: '8px 0 16px' }}>
              5 hours ago
            </p>
          </div>
        </div>
      </section>

      <section className="actions-section">
        <div className="section-header">
          <h3>Admin Tools & Shortcuts</h3>
        </div>

        <div className="action-grid">
          <button
            type="button"
            className="action-card"
            onClick={() => navigate('/admin/flagged')}
          >
            <div className="action-icon">🚩</div>
            <h4>Flagged Apps</h4>
            <p>Review applications flagged for fraud</p>
          </button>

          <button
            type="button"
            className="action-card"
            onClick={() => navigate('/admin/requests')}
          >
            <div className="action-icon">📩</div>
            <h4>Info Requests</h4>
            <p>Track pending requests from students</p>
          </button>

          <button
            type="button"
            className="action-card"
            onClick={() => navigate('/admin/activity')}
          >
            <div className="action-icon">📊</div>
            <h4>System Activity</h4>
            <p>View system-wide activity logs</p>
          </button>
        </div>
      </section>
    </div>
  )
}
