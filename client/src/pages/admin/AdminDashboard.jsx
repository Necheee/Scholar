import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [stats, setStats] = useState({
    flaggedPending: 0,
    totalFlagged: 0
  })
  const [recentFlagged, setRecentFlagged] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setIsLoading(true)
        const { data } = await api.get('/applications/flagged')
        
        const pending = data.filter(app => app.status === 'Under Admin review')
        
        setStats({
          flaggedPending: pending.length,
          totalFlagged: data.length
        })
        
        setRecentFlagged(pending.slice(0, 3))
      } catch (error) {
        console.error('Failed to load admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  if (isLoading) return <div>Loading dashboard...</div>

  return (
    <div className="dashboard">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2>Welcome, {user?.name || 'Admin'}</h2>
          <p className="section-meta">
            Overview of system activity, fraud detection, and manual review queues.
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

      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #eab308' }}>
          <div className="stat-value">{stats.flaggedPending}</div>
          <div className="stat-label">Action Required (Flagged)</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="stat-value">{stats.totalFlagged}</div>
          <div className="stat-label">Total Historically Flagged</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Urgent Fraud Reviews</h3>
        
        {recentFlagged.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--color-ink-soft)' }}>
              No applications require manual admin review at this time. The fraud engine queue is clear!
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Opportunity</th>
                  <th>Flagged On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentFlagged.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.student.name}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                        {app.student.email}
                      </div>
                    </td>
                    <td>{app.sponsorship?.title}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="secondary-button"
                        onClick={() => navigate('/admin/flagged')}
                      >
                        Resolve
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
