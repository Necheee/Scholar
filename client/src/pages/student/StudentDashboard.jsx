import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [stats, setStats] = useState({
    activeApplications: 0,
    sponsorshipsAvailable: 0,
    awarded: 0
  })
  
  const [activeApp, setActiveApp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        const [sponsorshipsRes, applicationsRes] = await Promise.all([
          api.get('/sponsorships'),
          api.get('/applications/my-applications')
        ])

        const sponsorships = sponsorshipsRes.data
        const applications = applicationsRes.data

        const activeApplication = applications.find(a => 
          a.status !== 'Rejected' && a.status !== 'Approved'
        )
        
        const awarded = applications.filter(a => a.status === 'Approved').length

        setStats({
          activeApplications: activeApplication ? 1 : 0,
          sponsorshipsAvailable: sponsorships.length,
          awarded: awarded
        })

        setActiveApp(activeApplication || null)
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
          <h2>Welcome, {user?.name || 'Student'}</h2>
          <p className="section-meta">Overview of your funding opportunities and applications.</p>
        </div>
        <button 
          className="primary-button" 
          onClick={() => navigate('/student/sponsorships')}
        >
          Browse Opportunities
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="stat-value">{stats.activeApplications}</div>
          <div className="stat-label">Active Applications</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #22c55e' }}>
          <div className="stat-value">{stats.sponsorshipsAvailable}</div>
          <div className="stat-label">Sponsorships Available</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="stat-value">{stats.awarded}</div>
          <div className="stat-label">Awarded Scholarships</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Current Application Status</h3>
        
        {activeApp ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{activeApp.sponsorship?.title}</h4>
                {/* <p style={{ margin: 0, color: 'var(--color-ink-soft)', fontSize: '0.9rem' }}>
                  {activeApp.sponsorship?.sponsor?.name}
                </p> */}
              </div>
              <span className="status-badge status-active">
                {activeApp.status}
              </span>
            </div>
            
            <div style={{ background: 'var(--color-paper-border)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Submitted on:</span>
                <strong>{new Date(activeApp.createdAt).toLocaleDateString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Current Stage:</span>
                <strong>
                  {activeApp.status === 'Under screening' ? 'Automated Review (Fraud Engine)' :
                   activeApp.status === 'Under Admin review' ? 'Manual Admin Review' :
                   activeApp.status === 'Under Sponsor review' ? 'Final Sponsor Review' : 'Processing'}
                </strong>
              </div>
            </div>
            
            <button 
              className="secondary-button" 
              style={{ alignSelf: 'flex-start' }}
              onClick={() => navigate('/student/applications')}
            >
              View Full History
            </button>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--color-ink-soft)', marginBottom: '16px' }}>
              You do not have any active applications under review.
            </p>
            <button 
              className="primary-button"
              onClick={() => navigate('/student/sponsorships')}
            >
              Find a Sponsorship
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
