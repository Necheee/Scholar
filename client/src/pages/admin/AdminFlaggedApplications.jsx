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
      alert(`Application ${decision === 'approve' || decision === 'pass' ? 'cleared' : decision === 'request_info' ? 'sent for more information' : 'rejected'} successfully.`)
    } catch (error) {
      console.error('Review failed:', error)
      alert(error.response?.data?.message || 'Failed to submit review')
    }
  }

  if (isLoading) return <div>Loading flagged applications...</div>

  return (
    <div className="admin-flagged-page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Fraud Review Queue</h2>
          <p className="section-meta" style={{ fontSize: '0.95rem' }}>
            Review and adjudicate applications flagged by the automated integrity screening engine.
          </p>
        </div>
      </div>

      <div className="filters-row" style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
        <div className="field-group" style={{ minWidth: '240px', marginBottom: 0 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Filter by Status</label>
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px' }}>
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
              <th style={{ width: '24%' }}>Applicant</th>
              <th style={{ width: '26%' }}>Opportunity</th>
              <th style={{ width: '18%' }}>Risk Signal</th>
              <th style={{ width: '14%' }}>Flagged On</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-ink-soft)' }}>
                  No applications currently require your review. Good job!
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>{app.student?.name || 'Applicant'}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', marginTop: '2px' }}>
                      {app.student?.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{app.sponsorship?.title}</div>
                  </td>
                  <td>
                    <span className="status-badge status-warning">
                      Flagged (Manual Review)
                    </span>
                  </td>
                  <td>{new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td>
                    {app.status === 'Under Admin review' ? (
                      <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.9rem' }}>Needs Review</span>
                    ) : (
                      <span style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem' }}>{app.status}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="secondary-button" 
                      onClick={() => setSelectedApp(app)}
                      style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '6px' }}
                    >
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
          <div className="modal-content" style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Inspect Flagged Application</h3>
                <p className="section-meta" style={{ fontSize: '0.85rem' }}>Automated rule engine diagnostics and adjudication</p>
              </div>
              <button 
                className="action-button" 
                onClick={() => setSelectedApp(null)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', border: '1px solid var(--color-border)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '28px', background: '#fcfaf7', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <div>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontWeight: 700 }}>
                  Applicant Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                  <p><strong>Name:</strong> {selectedApp.student?.name}</p>
                  <p><strong>Email:</strong> {selectedApp.student?.email}</p>
                  <p><strong>Institution:</strong> {selectedApp.academicInfoSnapshot?.institution || 'Covenant University'}</p>
                  <p><strong>Programme:</strong> {selectedApp.academicInfoSnapshot?.programme || 'N/A'}</p>
                  <p><strong>Level:</strong> {selectedApp.academicInfoSnapshot?.level || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontWeight: 700 }}>
                  Sponsorship Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                  <p><strong>Title:</strong> {selectedApp.sponsorship?.title}</p>
                  <p><strong>Status:</strong> {selectedApp.status}</p>
                  <p>
                    <strong>Fraud Status:</strong>{' '}
                    <span style={{ color: '#d32f2f', fontWeight: 600 }}>
                      {selectedApp.fraudReviewStatus} {selectedApp.fraudResult?.overallRisk ? `(${selectedApp.fraudResult.overallRisk} Risk)` : ''}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {selectedApp.fraudResult?.rulesTriggered?.length > 0 && (
              <div style={{ marginBottom: '28px', background: '#fff3cd', border: '1px solid #ffeeba', padding: '16px 20px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#856404', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px', fontWeight: 700 }}>
                  ⚠ Triggered Fraud Rules & Detected Evidence
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedApp.fraudResult.rulesTriggered.map((rule, idx) => (
                    <div key={idx} style={{ fontSize: '0.92rem', color: '#664d03', lineHeight: '1.5' }}>
                      <span style={{ background: '#f8d7da', color: '#842029', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem', marginRight: '8px' }}>
                        {rule.severity} Severity
                      </span>
                      <strong>{rule.ruleName}:</strong> {rule.evidence}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>
                Submitted Motivation Statement
              </h4>
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: '16px 20px', borderRadius: '10px', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedApp.reasonForRequesting || 'No statement provided.'}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>
                Attached Verification Documents
              </h4>
              {selectedApp.documents?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', padding: '12px 18px', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📄 {doc.type}</span>
                      <a href={doc.cloudinaryUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.88rem', color: 'var(--color-accent-strong, #5b3a2b)', fontWeight: 600, textDecoration: 'underline' }}>
                        View Document ↗
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--color-ink-soft)' }}>No documents provided.</p>
              )}
            </div>

            {selectedApp.status === 'Under Admin review' && (
              <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '24px', marginTop: '20px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '14px', fontWeight: 700 }}>Resolution Decision</h4>
                <div className="field-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Internal Note / Rejection Reason</label>
                  <textarea
                    rows="3"
                    placeholder="Provide a reason if rejecting, or notes for why this was cleared or flagged for information."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <button 
                    className="primary-button" 
                    style={{ background: '#d32f2f', color: '#fff', border: 'none', flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }} 
                    onClick={() => handleAdminDecision(selectedApp._id, 'reject')}
                  >
                    Reject Application (Fraud Confirmed)
                  </button>
                  <button 
                    className="primary-button" 
                    style={{ background: '#d97706', color: '#fff', border: 'none', flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }} 
                    onClick={() => handleAdminDecision(selectedApp._id, 'request_info')}
                  >
                    Request Info
                  </button>
                  <button 
                    className="primary-button" 
                    style={{ background: '#2e7d32', color: '#fff', border: 'none', flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }} 
                    onClick={() => handleAdminDecision(selectedApp._id, 'approve')}
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
