import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminFlaggedApplications() {
  const [flaggedApplications, setFlaggedApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [selectedApp, setSelectedApp] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [actionFilter, setActionFilter] = useState('All') // All, Pending, Reviewed

  useEffect(() => {
    fetchFlaggedApplications()
  }, [])

  async function fetchFlaggedApplications() {
    try {
      setIsLoading(true)
      const { data } = await api.get('/applications/flagged')
      setFlaggedApplications(data)
    } catch (error) {
      console.error('Failed to fetch flagged applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Derived filtered state (though /flagged only returns pending ones by default on the backend)
  // If the backend returns all flagged apps regardless of current status, we can filter them here.
  const filteredApps = flaggedApplications.filter(app => {
    if (actionFilter === 'Pending') return app.status === 'Under Admin review'
    if (actionFilter === 'Reviewed') return app.status !== 'Under Admin review'
    return true
  })

  async function handleAdminDecision(appId, decision) {
    if (decision === 'reject' && !reviewNote.trim()) {
      alert('You must provide a rejection reason/note.')
      return
    }

    try {
      const payload = {
        action: decision,
        reason: reviewNote
      }
      
      const { data } = await api.put(`/applications/${appId}/admin-review`, payload)
      
      // Update local state
      setFlaggedApplications(prev => prev.map(app => app._id === appId ? data : app))
      setSelectedApp(null)
      setReviewNote('')
      alert(`Application ${decision === 'pass' ? 'cleared' : 'rejected'} successfully.`)
    } catch (error) {
      console.error('Review failed:', error)
      alert(error.response?.data?.message || 'Failed to submit review')
    }
  }

  if (isLoading) return <div>Loading flagged applications...</div>

  return (
    <div className="admin-flagged-page">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Fraud Review Queue</h2>
          <p className="section-meta">
            Review applications that were flagged by the automated fraud detection engine.
          </p>
        </div>
      </div>

      <div className="filters-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div className="field-group" style={{ minWidth: '200px', marginBottom: 0 }}>
          <label>Status Filter</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="All">All Flagged</option>
            <option value="Pending">Needs Review</option>
            <option value="Reviewed">Already Handled</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Opportunity</th>
              <th>Risk Signal</th>
              <th>Flagged On</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-ink-soft)' }}>
                  No applications currently require your review. Good job!
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong>{app.student.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>
                      {app.student.email}
                    </div>
                  </td>
                  <td>{app.sponsorship?.title}</td>
                  <td>
                    <span className="status-badge status-warning">
                      Flagged (Manual Review)
                    </span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    {app.status === 'Under Admin review' ? (
                      <span style={{ color: '#d97706', fontWeight: 600 }}>Needs Review</span>
                    ) : (
                      <span style={{ color: 'var(--color-ink-soft)' }}>{app.status}</span>
                    )}
                  </td>
                  <td>
                    <button className="secondary-button" onClick={() => setSelectedApp(app)}>
                      Inspect
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
              <h3>Inspect Flagged Application</h3>
              <button className="action-button" onClick={() => setSelectedApp(null)}>X</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Applicant Info
                </h4>
                <p><strong>Name:</strong> {selectedApp.student.name}</p>
                <p><strong>Email:</strong> {selectedApp.student.email}</p>
                <p><strong>Institution:</strong> {selectedApp.academicInfoSnapshot?.institution || 'N/A'}</p>
                <p><strong>Programme:</strong> {selectedApp.academicInfoSnapshot?.programme || 'N/A'}</p>
                <p><strong>Level:</strong> {selectedApp.academicInfoSnapshot?.level || 'N/A'}</p>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Sponsorship Info
                </h4>
                <p><strong>Title:</strong> {selectedApp.sponsorship?.title}</p>
                <p><strong>Status:</strong> {selectedApp.status}</p>
                <p><strong>Fraud Engine Result:</strong> <span style={{ color: '#d32f2f', fontWeight: 600 }}>{selectedApp.fraudReviewStatus}</span></p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Application Context
              </h4>
              <div style={{ background: 'var(--color-paper-border)', padding: '12px', borderRadius: '8px', fontSize: '0.95rem' }}>
                {selectedApp.reasonForRequesting}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Attached Documents
              </h4>
              {selectedApp.documents?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--color-paper)', border: '1px solid var(--color-paper-border)', padding: '10px 14px', borderRadius: '6px' }}>
                      <span>{doc.type}</span>
                      <a href={doc.cloudinaryUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>View</a>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No documents provided.</p>
              )}
            </div>

            {selectedApp.status === 'Under Admin review' && (
              <div style={{ borderTop: '1px solid var(--color-paper-border)', paddingTop: '20px' }}>
                <h4 style={{ marginBottom: '12px' }}>Resolution Decision</h4>
                <div className="field-group">
                  <label>Internal Note / Rejection Reason</label>
                  <textarea
                    rows="3"
                    placeholder="Provide a reason if rejecting, or notes for why this was cleared."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button 
                    className="primary-button" 
                    style={{ background: '#d32f2f', color: '#fff', border: 'none', flex: 1 }} 
                    onClick={() => handleAdminDecision(selectedApp._id, 'reject')}
                  >
                    Reject Application (Fraud Confirmed)
                  </button>
                  <button 
                    className="primary-button" 
                    style={{ background: '#2e7d32', color: '#fff', border: 'none', flex: 1 }} 
                    onClick={() => handleAdminDecision(selectedApp._id, 'pass')}
                  >
                    Clear Application (Send to Sponsor)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
