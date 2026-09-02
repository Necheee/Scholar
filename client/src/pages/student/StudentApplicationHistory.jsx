import { useNavigate } from 'react-router-dom'

export default function StudentApplicationHistory() {
  const navigate = useNavigate()

  // Mock application history
  const applications = [
    {
      id: 'app-001',
      sponsorshipTitle: 'Full Tuition + Living Expenses',
      sponsor: 'Merit Foundation',
      submittedDate: '2026-08-28',
      status: 'In Review',
      statusColor: 'info',
      decision: null,
      decidedDate: null,
    },
    {
      id: 'app-003',
      sponsorshipTitle: 'STEM Excellence Award',
      sponsor: 'TechForward Foundation',
      submittedDate: '2026-08-15',
      status: 'Declined',
      statusColor: 'danger',
      decision: 'Not Selected',
      decidedDate: '2026-08-25',
    },
    {
      id: 'app-004',
      sponsorshipTitle: 'Global Leaders Initiative',
      sponsor: 'International Partnerships Ltd',
      submittedDate: '2026-07-20',
      status: 'Accepted',
      statusColor: 'success',
      decision: 'Accepted',
      decidedDate: '2026-08-10',
    },
    {
      id: 'app-005',
      sponsorshipTitle: 'Arts & Humanities Grant',
      sponsor: 'Creative Minds Fund',
      submittedDate: '2026-07-05',
      status: 'Rejected',
      statusColor: 'danger',
      decision: 'Not Selected',
      decidedDate: '2026-07-15',
    },
  ]

  const drafts = [
    {
      id: 'app-002',
      sponsorshipTitle: 'Healthcare Professionals Scholarship',
      sponsor: 'Health Futures Foundation',
      savedDate: '2026-08-20',
      progress: 40,
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return '✓'
      case 'In Review':
        return '⏳'
      case 'Declined':
      case 'Rejected':
        return '✕'
      default:
        return '•'
    }
  }

  return (
    <div className="application-history">
      {/* Submitted Applications */}
      <section className="history-section">
        <div className="section-header">
          <h3>Submitted Applications</h3>
          <p className="section-meta">{applications.length} applications</p>
        </div>

        <div className="applications-list">
          {applications.map(app => (
            <div key={app.id} className="card application-history-card">
              <div className="card-header">
                <div>
                  <h4>{app.sponsorshipTitle}</h4>
                  <p className="sponsor-name">{app.sponsor}</p>
                </div>
                <span className={`status-badge status-${app.statusColor}`}>
                  {getStatusIcon(app.status)} {app.status}
                </span>
              </div>

              <div className="timeline">
                <div className="timeline-item">
                  <span className="timeline-label">Submitted</span>
                  <span className="timeline-date">{app.submittedDate}</span>
                </div>
                {app.decidedDate && (
                  <div className="timeline-item">
                    <span className="timeline-label">Decision</span>
                    <span className="timeline-date">{app.decidedDate}</span>
                  </div>
                )}
              </div>

              {app.decision && (
                <p className="decision-note">
                  <strong>{app.decision}</strong>
                </p>
              )}

              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate(`/student/application/${app.id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Draft Applications */}
      {drafts.length > 0 && (
        <section className="history-section">
          <div className="section-header">
            <h3>Draft Applications</h3>
            <p className="section-meta">{drafts.length} draft(s)</p>
          </div>

          <div className="drafts-list">
            {drafts.map(draft => (
              <div key={draft.id} className="card draft-history-card">
                <div className="card-header">
                  <div>
                    <h4>{draft.sponsorshipTitle}</h4>
                    <p className="sponsor-name">{draft.sponsor}</p>
                  </div>
                  <span className="badge badge-warning">Draft</span>
                </div>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${draft.progress}%` }} />
                  </div>
                  <p className="progress-text">{draft.progress}% Complete</p>
                </div>

                <p className="draft-meta">Saved {draft.savedDate}</p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate(`/student/application/draft/${draft.id}`)}
                >
                  Continue Draft
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {applications.length === 0 && drafts.length === 0 && (
        <div className="empty-state">
          <p className="empty-icon">📋</p>
          <h4>No applications yet</h4>
          <p>Start by browsing sponsorships and submitting your first application</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/student/sponsorships')}
          >
            Browse Sponsorships
          </button>
        </div>
      )}
    </div>
  )
}
