import { useNavigate } from 'react-router-dom'

export default function SponsorDashboard() {
  const navigate = useNavigate()

  const stats = [
    { label: 'Active Sponsorships', value: 3, color: 'accent' },
    { label: 'Applications to Review', value: 5, color: 'warning' },
    { label: 'Awarded Students', value: 12, color: 'success' },
  ]

  // Applications that passed fraud detection and are waiting for sponsor decision
  const pendingReviews = [
    {
      id: 'app-101',
      studentName: 'Chiamaka Okafor',
      institution: 'University of Lagos',
      programme: 'Computer Engineering',
      sponsorshipTitle: 'STEM Excellence Scholarship',
      dateCleared: '2026-09-03',
      gpa: '3.92',
    },
    {
      id: 'app-102',
      studentName: 'David Adeleke',
      institution: 'Covenant University',
      programme: 'Electrical Electronics',
      sponsorshipTitle: 'Future Tech Leaders Grant',
      dateCleared: '2026-09-02',
      gpa: '3.85',
    },
    {
      id: 'app-103',
      studentName: 'Fatima Bello',
      institution: 'Ahmadu Bello University',
      programme: 'Software Engineering',
      sponsorshipTitle: 'Women in Technology Award',
      dateCleared: '2026-09-01',
      gpa: '3.78',
    },
  ]

  // Current sponsorships managed by this sponsor
  const activeSponsorships = [
    {
      id: 'sp-01',
      title: 'STEM Excellence Scholarship',
      awardAmount: '$5,000 / session',
      applicantsCount: 14,
      deadline: '2026-10-15',
      status: 'Active (Locked)',
      lockedReason: 'Locked: Received 14 applications',
    },
    {
      id: 'sp-02',
      title: 'Future Tech Leaders Grant',
      awardAmount: '$3,500 / session',
      applicantsCount: 8,
      deadline: '2026-10-30',
      status: 'Active (Locked)',
      lockedReason: 'Locked: Received 8 applications',
    },
    {
      id: 'sp-03',
      title: 'Undergraduate Innovation Fund',
      awardAmount: '$2,000 one-time',
      applicantsCount: 0,
      deadline: '2026-11-15',
      status: 'Active (Editable)',
      lockedReason: 'Editable: No applications submitted yet',
    },
  ]

  return (
    <div className="student-dashboard">
      {/* Welcome & Organization Banner */}
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Sponsor Management Portal</h3>
            <p className="section-meta">
              Manage your sponsorship funds, review verified student applications, and discover talent.
            </p>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/sponsor/opportunities')}
          >
            + Create Sponsorship
          </button>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="stats-grid">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={`stat-card stat-${color}`}>
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
          </div>
        ))}
      </section>

      {/* Priority Section: Applications Awaiting Review */}
      <section className="active-section">
        <div className="section-header">
          <div>
            <h3>Applications to Review</h3>
            <p className="section-meta">
              Security screened & verified applications ready for your funding decision
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/sponsor/applications')}
          >
            View All ({pendingReviews.length})
          </button>
        </div>

        <div className="content-grid">
          {pendingReviews.map((app) => (
            <div key={app.id} className="card">
              <div className="card-header">
                <div>
                  <h4>{app.studentName}</h4>
                  <p className="card-meta">
                    {app.programme} • {app.institution}
                  </p>
                </div>
                <span className="badge badge-warning">Needs Review</span>
              </div>

              <div className="timeline" style={{ margin: '12px 0' }}>
                <div className="timeline-item">
                  <span className="timeline-label">Opportunity</span>
                  <span className="timeline-date" style={{ fontSize: '0.88rem' }}>
                    {app.sponsorshipTitle}
                  </span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Current GPA</span>
                  <span className="timeline-date">{app.gpa}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Screened Date</span>
                  <span className="timeline-date">{app.dateCleared}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="primary-button"
                  style={{ flex: 1 }}
                  onClick={() => navigate('/sponsor/applications')}
                >
                  Review Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Sponsorship Opportunities */}
      <section className="active-section">
        <div className="section-header">
          <div>
            <h3>My Sponsorship Opportunities</h3>
            <p className="section-meta">
              Overview of your active funding listings and application counts
            </p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate('/sponsor/opportunities')}
          >
            Manage All
          </button>
        </div>

        <div className="content-grid">
          {activeSponsorships.map((sponsorship) => (
            <div key={sponsorship.id} className="card">
              <div className="card-header">
                <div>
                  <h4>{sponsorship.title}</h4>
                  <p className="card-meta">Award: {sponsorship.awardAmount}</p>
                </div>
                <span
                  className={`badge ${
                    sponsorship.applicantsCount > 0 ? 'badge-info' : 'badge-success'
                  }`}
                >
                  {sponsorship.status}
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', margin: '8px 0 16px' }}>
                ℹ️ {sponsorship.lockedReason}
              </p>

              <div className="timeline" style={{ margin: '8px 0 16px' }}>
                <div className="timeline-item">
                  <span className="timeline-label">Total Applicants</span>
                  <span className="timeline-date">{sponsorship.applicantsCount}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Application Deadline</span>
                  <span className="timeline-date">{sponsorship.deadline}</span>
                </div>
              </div>

              <button
                type="button"
                className="secondary-button"
                style={{ width: '100%' }}
                onClick={() => navigate('/sponsor/opportunities')}
              >
                View Opportunity Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <div className="section-header">
          <h3>Sponsor Tools & Shortcuts</h3>
        </div>

        <div className="action-grid">
          <button
            type="button"
            className="action-card"
            onClick={() => navigate('/sponsor/opportunities')}
          >
            <div className="action-icon">🎯</div>
            <h4>Create Sponsorship</h4>
            <p>Publish a new funding opportunity</p>
          </button>

          <button
            type="button"
            className="action-card"
            onClick={() => navigate('/sponsor/applications')}
          >
            <div className="action-icon">📝</div>
            <h4>Review Applications</h4>
            <p>Approve or decline screened candidates</p>
          </button>

          <button
            type="button"
            className="action-card"
            onClick={() => navigate('/sponsor/students')}
          >
            <div className="action-icon">👥</div>
            <h4>Student Directory</h4>
            <p>Discover students seeking sponsorship</p>
          </button>

          <button
            type="button"
            className="action-card"
            onClick={() => navigate('/sponsor/profile')}
          >
            <div className="action-icon">🏢</div>
            <h4>Organization Profile</h4>
            <p>Manage your sponsor organization details</p>
          </button>
        </div>
      </section>
    </div>
  )
}

