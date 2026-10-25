import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import ProvideInfoModal from '../../components/ProvideInfoModal'
import PaymentReceiptModal from '../../components/PaymentReceiptModal'

export default function StudentApplicationHistory() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [provideInfoAppId, setProvideInfoAppId] = useState(null)
  const [viewReceiptAppId, setViewReceiptAppId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')

  const [isWithdrawing, setIsWithdrawing] = useState(null)

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
    if (!window.confirm('Are you sure you want to withdraw this application? This action will cancel your submission.')) return
    try {
      setIsWithdrawing(appId)
      await api.put(`/applications/${appId}/withdraw`)
      alert('Application withdrawn successfully.')
      await fetchApplications()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to withdraw application')
    } finally {
      setIsWithdrawing(null)
    }
  }

  function getStatusStyle(status) {
    if (status === 'Approved' || status === 'Grant Disbursed') return 'status-active'
    if (status === 'Rejected' || status === 'Withdrawn') return 'status-closed'
    if (status === 'Waiting for additional information' || status === 'Under Admin review') return 'status-warning'
    return 'status-info' // 'Under screening', 'Under Sponsor review'
  }

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'Action Required') return app.status === 'Waiting for additional information'
    if (statusFilter === 'Under Review') return ['Under screening', 'Under Admin review', 'Under Sponsor review'].includes(app.status)
    if (statusFilter === 'Approved') return app.status === 'Approved'
    if (statusFilter === 'Grant Disbursed') return app.status === 'Grant Disbursed'
    if (statusFilter === 'Rejected') return app.status === 'Rejected'
    if (statusFilter === 'Withdrawn') return app.status === 'Withdrawn'
    return true
  })

  const selectedProvideInfoApp = applications.find((a) => a._id === provideInfoAppId)

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading application history...</div>

  return (
    <div className="application-history" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="section-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>My Applications</h2>
          <p className="section-meta" style={{ fontSize: '0.95rem' }}>
            Track the progress of your scholarship submissions and manage active requests.
          </p>
        </div>
        <button 
          className="primary-button" 
          onClick={() => navigate('/student/sponsorships')}
          style={{ padding: '10px 20px', borderRadius: '8px' }}
        >
          Find Opportunities
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-ink-soft)' }}>
          <h3 style={{ marginBottom: '8px', color: 'var(--color-ink)' }}>No applications submitted yet</h3>
          <p style={{ marginBottom: '20px' }}>Explore open opportunities and submit your first scholarship application.</p>
          <button className="primary-button" onClick={() => navigate('/student/sponsorships')}>
            Browse Sponsorships
          </button>
        </div>
      ) : (
        <>
          <div className="filters-row" style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
            <div className="field-group" style={{ minWidth: '240px', marginBottom: 0 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Filter by Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: '#fff', fontSize: '0.92rem' }}
              >
                <option value="All">All Applications</option>
                <option value="Action Required">Action Required</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Grant Disbursed">Grant Disbursed</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '36%' }}>Opportunity</th>
                  <th style={{ width: '18%' }}>Submitted On</th>
                  <th style={{ width: '26%' }}>Status</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-ink-soft)' }}>
                      No applications match your selected status.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong style={{ fontSize: '0.98rem', color: 'var(--color-ink)' }}>
                        {app.sponsorship?.title || 'Unknown Opportunity'}
                      </strong>
                      <div style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                        Tuition Grant: ₦{(app.sponsorship?.grantAmount || 250000).toLocaleString()}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-ink-soft)', whiteSpace: 'nowrap' }}>
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span className={`status-badge ${getStatusStyle(app.status)}`}>
                          {app.status}
                        </span>
                        {app.status === 'Grant Disbursed' && app.fundingStatus && (
                          <div style={{ fontSize: '0.8rem', color: app.fundingStatus.isFundedActive ? '#15803d' : '#4b5563', fontWeight: 500 }}>
                            {app.fundingStatus.isFundedActive
                              ? `Active Duration (${app.fundingStatus.daysRemaining} days left)`
                              : `Concluded (${app.sponsorship?.duration || '1 Session'})`}
                          </div>
                        )}
                        {app.status === 'Rejected' && app.rejectionReason && (
                          <div style={{ fontSize: '0.8rem', color: '#c62828' }}>
                            <strong>Reason:</strong> {app.rejectionReason}
                          </div>
                        )}
                        {app.status === 'Waiting for additional information' && (
                          <div style={{ fontSize: '0.82rem', color: '#b45309' }}>
                            Action required: submit requested document
                            {app.reasonForRequesting && (
                              <div style={{ fontStyle: 'italic', color: '#92400e', marginTop: '2px' }}>
                                Note: "{app.reasonForRequesting}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {app.status === 'Waiting for additional information' && (
                          <button 
                            className="primary-button" 
                            style={{ padding: '6px 14px', fontSize: '0.82rem', background: '#d97706', border: 'none', color: '#fff' }}
                            onClick={() => setProvideInfoAppId(app._id)}
                          >
                            Provide Info
                          </button>
                        )}
                        
                        {!['Approved', 'Grant Disbursed', 'Rejected', 'Withdrawn'].includes(app.status) && (
                          <button 
                            className="secondary-button" 
                            style={{ 
                              padding: '6px 14px', 
                              fontSize: '0.82rem',
                              borderColor: '#e7d9c7',
                              color: '#c62828'
                            }}
                            disabled={isWithdrawing === app._id}
                            onClick={() => handleWithdraw(app._id)}
                          >
                            {isWithdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                          </button>
                        )}

                        {app.status === 'Approved' && (
                          <span style={{ color: '#2e7d32', fontWeight: 600, fontSize: '0.88rem' }}>
                            ✓ Grant Active
                          </span>
                        )}

                        {app.status === 'Grant Disbursed' && (
                          <button 
                            type="button"
                            className="secondary-button" 
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewReceiptAppId(app._id)
                            }}
                            style={{ padding: '6px 14px', fontSize: '0.82rem', borderColor: '#2e7d32', color: '#2e7d32', fontWeight: 600 }}
                          >
                            ✓ Grant Disbursed (Receipt)
                          </button>
                        )}

                        {app.status === 'Withdrawn' && (
                          <span style={{ color: 'var(--color-ink-soft)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            Withdrawn
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {provideInfoAppId && (
        <ProvideInfoModal 
          appId={provideInfoAppId}
          reason={selectedProvideInfoApp?.reasonForRequesting}
          onClose={() => setProvideInfoAppId(null)}
          onRefresh={fetchApplications}
        />
      )}

      {viewReceiptAppId && (
        <PaymentReceiptModal
          applicationId={viewReceiptAppId}
          onClose={() => setViewReceiptAppId(null)}
        />
      )}
    </div>
  )
}
