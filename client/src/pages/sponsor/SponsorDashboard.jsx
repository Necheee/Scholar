import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function SponsorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [stats, setStats] = useState({
    activeSponsorships: 0,
    applicationsToReview: 0,
    awardedStudents: 0
  })
  
  const [pendingReviews, setPendingReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        const [sponsorshipsRes, applicationsRes] = await Promise.all([
          api.get('/sponsorships'),
          api.get('/applications/sponsor-applications')
        ])

        const sponsorships = sponsorshipsRes.data
        const applications = applicationsRes.data

        const activeSponsorships = sponsorships.filter(s => s.status === 'Active').length
        const appsToReview = applications.filter(a => a.status === 'Under Sponsor review')
        const awardedApps = applications.filter(a => a.status === 'Approved').length

        setStats({
          activeSponsorships,
          applicationsToReview: appsToReview.length,
          awardedStudents: awardedApps
        })

        // Get top 3 most recent apps for review
        setPendingReviews(appsToReview.slice(0, 3))
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) return <div>Loading dashboard...</div>

  return (
    <div className="dashboard">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2>Welcome, {user?.name || 'Sponsor'}</h2>
          <p className="section-meta">Overview of your funding programs and applicant pipeline.</p>
        </div>
        <button 
          className="primary-button" 
          onClick={() => navigate('/sponsor/opportunities')}
        >
          Manage Opportunities
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="stat-value">{stats.activeSponsorships}</div>
          <div className="stat-label">Active Sponsorships</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #eab308' }}>
          <div className="stat-value">{stats.applicationsToReview}</div>
          <div className="stat-label">Applications to Review</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #22c55e' }}>
          <div className="stat-value">{stats.awardedStudents}</div>
          <div className="stat-label">Awarded Students</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Pending Applications (Needs Review)</h3>
          <button className="action-button" onClick={() => navigate('/sponsor/applications')}>
            View All →
          </button>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--color-ink-soft)' }}>No applications currently waiting for your review.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Opportunity</th>
                  <th>Submitted On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviews.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.student.name}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                        {app.academicInfoSnapshot?.institution || 'Institution N/A'}
                      </div>
                    </td>
                    <td>{app.sponsorship.title}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="secondary-button"
                        onClick={() => navigate('/sponsor/applications', { state: { sponsorshipId: app.sponsorship._id } })}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
