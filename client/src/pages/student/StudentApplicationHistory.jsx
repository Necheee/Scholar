import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import ProvideInfoModal from '../../components/ProvideInfoModal'

export default function StudentApplicationHistory() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [provideInfoAppId, setProvideInfoAppId] = useState(null)

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

  async function handleWithdraw(appId) {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return
    try {
      await api.put(`/applications/${appId}/withdraw`)
      fetchApplications()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to withdraw application')
    }
  }

  function getStatusStyle(status) {
    if (status === 'Approved') return 'status-active'
    if (status === 'Rejected' || status === 'Withdrawn') return 'status-closed'
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
                        {app.status === 'Waiting for additional information' && (
                          <button 
                            className="primary-button" 
                            style={{ padding: '4px 12px', fontSize: '0.8rem', marginTop: '4px' }}
                            onClick={() => setProvideInfoAppId(app._id)}
                          >
                            Provide Missing Info
                          </button>
                        )}
                        {app.status !== 'Rejected' && app.status !== 'Approved' && app.status !== 'Waiting for additional information' && app.status !== 'Withdrawn' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>Being Processed</div>
                            <button 
                              className="secondary-button" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '4px', width: 'fit-content' }}
                              onClick={() => handleWithdraw(app._id)}
                            >
                              Withdraw
                            </button>
                          </div>
                        )}
                        {app.status === 'Withdrawn' && (
                          <div style={{ color: '#d32f2f' }}>Application Withdrawn</div>
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

      {provideInfoAppId && (
        <ProvideInfoModal 
          appId={provideInfoAppId}
          onClose={() => setProvideInfoAppId(null)}
          onRefresh={fetchApplications}
        />
      )}
    </div>
  )
}
