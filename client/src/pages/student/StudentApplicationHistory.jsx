import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function StudentApplicationHistory() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      setIsLoading(true)
      const { data } = await api.get('/applications/my-applications')
      setApplications(data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function getStatusStyle(status) {
    if (status === 'Approved') return 'status-active'
    if (status === 'Rejected') return 'status-closed'
    if (status === 'Flagged') return 'status-warning'
    return 'status-active' // Default styling for 'In Review', 'Under screening', etc.
  }

  if (isLoading) return <div>Loading application history...</div>

  return (
    <div className="application-history">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>My Applications</h2>
          <p className="section-meta">
            Track the status of your scholarship and funding requests.
          </p>
        </div>
        <button 
          className="primary-button" 
          onClick={() => navigate('/student/sponsorships')}
        >
          Find Opportunities
        </button>
      </div>

      <div className="card">
        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-ink-soft)' }}>
            <p>You haven't submitted any applications yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Submitted On</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.sponsorship?.title || 'Unknown Opportunity'}</strong>
                      {/* {app.sponsorship?.sponsor?.name && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                          {app.sponsorship.sponsor.name}
                        </div>
                      )} */}
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                        {app.status === 'Rejected' && app.rejectionReason && (
                          <div style={{ color: '#d32f2f' }}>Reason: {app.rejectionReason}</div>
                        )}
                        {app.status === 'Approved' && (
                          <div style={{ color: '#2e7d32' }}>Congratulations!</div>
                        )}
                        {app.status !== 'Rejected' && app.status !== 'Approved' && (
                          <div>Being Processed</div>
                        )}
                      </div>
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
