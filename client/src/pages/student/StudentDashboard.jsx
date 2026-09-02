import { useNavigate } from 'react-router-dom'

export default function StudentDashboard() {
  const navigate = useNavigate()

  const activeApplication = {
    id: 'app-001',
    sponsorshipId: 'opp-042',
    title: 'Full Tuition + Living Expenses',
    sponsor: 'Merit Foundation',
    status: 'In Review',
    submittedDate: '2026-08-28',
    expectedDecision: '2026-09-15',
    progress: 75,
  }

  const draftApplication = {
    id: 'app-002',
    title: 'STEM Excellence Award',
    sponsor: 'TechForward Org',
    savedDate: '2026-08-20',
    progress: 40,
  }

  const stats = [
    { label: 'Active Applications', value: 1, color: 'accent' },
    { label: 'Sponsorships Available', value: 23, color: 'success' },
    { label: 'Draft Applications', value: 1, color: 'warning' },
  ]

  return (
    <div className="student-dashboard">
      {/* Stats Overview */}
      <section className="stats-grid">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`stat-card stat-${color}`}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </section>

      {/* Active Application */}
      <section className="active-section">
        <div className="section-header">
          <h3>Current Application</h3>
          <span className="badge badge-info">In Review</span>
        </div>

        <div className="card application-card">
          <div className="card-header">
            <div>
              <h4>{activeApplication.title}</h4>
              <p className="card-meta">{activeApplication.sponsor}</p>
            </div>
            <span className="status-badge status-in-review">In Review</span>
          </div>

          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${activeApplication.progress}%` }} />
            </div>
            <p className="progress-text">{activeApplication.progress}% Complete</p>
          </div>

          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-label">Submitted</span>
              <span className="timeline-date">{activeApplication.submittedDate}</span>
            </div>
            <div className="timeline-item">
              <span className="timeline-label">Expected Decision</span>
              <span className="timeline-date">{activeApplication.expectedDecision}</span>
            </div>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate(`/student/application/${activeApplication.id}`)}
          >
            View Details
          </button>
        </div>
      </section>

      {/* Draft Application */}
      {draftApplication && (
        <section className="draft-section">
          <div className="section-header">
            <h3>Resume Your Draft</h3>
          </div>

          <div className="card draft-card">
            <div className="card-header">
              <div>
                <h4>{draftApplication.title}</h4>
                <p className="card-meta">{draftApplication.sponsor}</p>
              </div>
              <span className="badge badge-warning">Draft</span>
            </div>

            <p className="draft-meta">Saved {draftApplication.savedDate}</p>

            <button
              className="primary-button"
              onClick={() => navigate(`/student/application/draft/${draftApplication.id}`)}
            >
              Continue Application
            </button>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="actions-section">
        <div className="section-header">
          <h3>Quick Actions</h3>
        </div>

        <div className="action-grid">
          <button className="action-card" onClick={() => navigate('/student/sponsorships')}>
            <div className="action-icon">🔍</div>
            <h4>Browse Sponsorships</h4>
            <p>Discover new opportunities</p>
          </button>

          <button className="action-card" onClick={() => navigate('/student/application/new')}>
            <div className="action-icon">✏️</div>
            <h4>New Application</h4>
            <p>Start a fresh application</p>
          </button>

          <button className="action-card" onClick={() => navigate('/student/history')}>
            <div className="action-icon">📋</div>
            <h4>Application History</h4>
            <p>View past applications</p>
          </button>

          <button className="action-card" onClick={() => navigate('/student/profile')}>
            <div className="action-icon">👤</div>
            <h4>Profile</h4>
            <p>Update your information</p>
          </button>
        </div>
      </section>

      {/* Seeking Sponsorship Toggle */}
      <section className="seeking-section">
        <div className="seeking-card">
          <div className="seeking-header">
            <h4>Seeking Sponsorship Status</h4>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked={true} />
              <span className="toggle-slider" />
            </label>
          </div>
          <p className="seeking-description">
            When enabled, sponsors can find you in the student directory and may reach out with opportunities.
          </p>
        </div>
      </section>
    </div>
  )
}
