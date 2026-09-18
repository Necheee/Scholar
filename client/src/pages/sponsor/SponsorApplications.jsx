import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'

export default function SponsorApplications() {
  const { state } = useLocation()
  const initialSponsorshipId = state?.sponsorshipId || 'All'

  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterSponsorship, setFilterSponsorship] = useState(initialSponsorshipId)
  const [filterStatus, setFilterStatus] = useState('All')
  
  const [selectedApp, setSelectedApp] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    try {
      setIsLoading(true)
      const { data } = await api.get('/applications/sponsor-applications')
      setApplications(data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique sponsorship titles for the filter dropdown
  const uniqueSponsorships = Array.from(new Set(applications.map((a) => a.sponsorship._id))).map((id) => {
    return applications.find((a) => a.sponsorship._id === id).sponsorship
  })

  const filteredApps = applications.filter((app) => {
    if (filterSponsorship !== 'All' && app.sponsorship._id !== filterSponsorship) return false
    if (filterStatus === 'Under Sponsor review' && app.status !== 'Under Sponsor review') return false
    if (filterStatus === 'Approved' && app.status !== 'Approved') return false
    if (filterStatus === 'Rejected' && app.status !== 'Rejected') return false
    return true
  })

  async function handleDecision(appId, decision) {
    if (decision === 'reject' && !rejectReason.trim()) {
      alert('Please provide a reason for rejection.')
      return
    }

    try {
      const payload = {
        action: decision,
        reason: decision === 'reject' ? rejectReason : undefined
      }

      const { data } = await api.put(`/applications/${appId}/sponsor-review`, payload)
      
      // Update local state
      setApplications(prev => prev.map(app => app._id === appId ? data : app))
      setSelectedApp(null)
      setRejectReason('')
      alert(`Application ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`)
    } catch (error) {
      console.error('Decision error:', error)
      alert(error.response?.data?.message || 'Failed to process decision')
    }
  }

  if (isLoading) return <div>Loading applications...</div>

  return (
    <div className="applications-manager">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>Review Applications</h2>
          <p className="section-meta">
            Review students who have passed the initial automated screening and admin review.
          </p>
        </div>
      </div>

      <div className="filters-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="field-group" style={{ flex: 1, minWidth: '200px' }}>
          <label>Filter by Opportunity</label>
          <select value={filterSponsorship} onChange={(e) => setFilterSponsorship(e.target.value)}>
            <option value="All">All Opportunities</option>
            {uniqueSponsorships.map((sp) => (
              <option key={sp._id} value={sp._id}>{sp.title}</option>
            ))}
          </select>
        </div>
        <div className="field-group" style={{ flex: 1, minWidth: '200px' }}>
          <label>Filter by Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Under Sponsor review">Needs Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Opportunity</th>
              <th>Submitted On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-ink-soft)' }}>
                  No applications match your filters.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.student.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>{app.student.email}</div>
                  </td>
                  <td>{app.sponsorship.title}</td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${app.status === 'Approved' ? 'status-active' : app.status === 'Rejected' ? 'status-closed' : 'status-warning'}`}>
                      {app.status === 'Under Sponsor review' ? 'Needs Review' : app.status}
                    </span>
                  </td>
                  <td>
                    <button className="secondary-button" onClick={() => setSelectedApp(app)}>
                      View & Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail & Review Modal */}
      {selectedApp && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Application Details</h3>
              <button className="action-button" onClick={() => setSelectedApp(null)}>X</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Applicant Info
                </h4>
                <p><strong>Name:</strong> {selectedApp.student.name}</p>
                <p><strong>Email:</strong> {selectedApp.student.email}</p>
                {/* Fallback to snapshot if profile is not joined */}
                <p><strong>Programme:</strong> {selectedApp.academicInfoSnapshot?.programme || 'N/A'}</p>
                <p><strong>Level:</strong> {selectedApp.academicInfoSnapshot?.level || 'N/A'}</p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Opportunity
                </h4>
                <p><strong>Title:</strong> {selectedApp.sponsorship.title}</p>
                <p><strong>Status:</strong> {selectedApp.status}</p>
                <p><strong>Applied On:</strong> {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Reason for Requesting
              </h4>
              <div style={{ background: 'var(--color-paper-border)', padding: '12px', borderRadius: '8px', fontSize: '0.95rem' }}>
                {selectedApp.reasonForRequesting}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Submitted Documents
              </h4>
              {selectedApp.documents?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-paper)', border: '1px solid var(--color-paper-border)', padding: '10px 14px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.9rem' }}>{doc.type}</span>
                      <a href={doc.cloudinaryUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        View Document
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No documents provided.</p>
              )}
            </div>

            {selectedApp.status === 'Under Sponsor review' && (
              <div style={{ borderTop: '1px solid var(--color-paper-border)', paddingTop: '20px' }}>
                <h4 style={{ marginBottom: '12px' }}>Make a Decision</h4>
                <div className="field-group">
                  <label>Rejection Reason (Required only if rejecting)</label>
                  <input
                    type="text"
                    placeholder="e.g. Does not meet minimum academic requirements"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="primary-button" style={{ background: '#d32f2f', color: '#fff', border: 'none' }} onClick={() => handleDecision(selectedApp._id, 'reject')}>
                    Reject Application
                  </button>
                  <button className="primary-button" style={{ background: '#2e7d32', color: '#fff', border: 'none' }} onClick={() => handleDecision(selectedApp._id, 'approve')}>
                    Approve Application
                  </button>
                </div>
              </div>
            )}
            
            {selectedApp.status === 'Rejected' && selectedApp.rejectionReason && (
              <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '8px', marginTop: '16px', color: '#991b1b' }}>
                <strong>Rejection Reason:</strong> {selectedApp.rejectionReason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
