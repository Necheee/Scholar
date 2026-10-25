import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'
import PaystackDisbursementModal from '../../components/PaystackDisbursementModal'
import PaymentReceiptModal from '../../components/PaymentReceiptModal'

export default function SponsorApplications() {
  const { state } = useLocation()
  const initialSponsorshipId = state?.sponsorshipId || 'All'

  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterSponsorship, setFilterSponsorship] = useState(initialSponsorshipId)
  const [filterStatus, setFilterStatus] = useState('All')
  
  const [selectedApp, setSelectedApp] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [disburseApp, setDisburseApp] = useState(null)
  const [viewReceiptAppId, setViewReceiptAppId] = useState(null)

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
  const uniqueSponsorships = Array.from(
    new Set(applications.filter(a => a.sponsorship?._id).map((a) => a.sponsorship._id))
  ).map((id) => {
    return applications.find((a) => a.sponsorship?._id === id)?.sponsorship
  }).filter(Boolean)

  const filteredApps = applications.filter((app) => {
    if (filterSponsorship !== 'All' && app.sponsorship?._id !== filterSponsorship) return false
    if (filterStatus === 'Under Sponsor review' && app.status !== 'Under Sponsor review') return false
    if (filterStatus === 'Approved' && app.status !== 'Approved') return false
    if (filterStatus === 'Grant Disbursed' && app.status !== 'Grant Disbursed') return false
    if (filterStatus === 'Rejected' && app.status !== 'Rejected') return false
    return true
  })

  function getStatusBadgeClass(status) {
    if (status === 'Approved' || status === 'Grant Disbursed') return 'status-active'
    if (status === 'Rejected') return 'status-closed'
    return 'status-warning'
  }

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
    <div className="applications-manager" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Review Applications</h2>
          <p className="section-meta" style={{ fontSize: '0.95rem' }}>
            Review applicants who have passed automated screening and disburse approved educational tuition grants.
          </p>
        </div>
      </div>

      <div className="filters-row" style={{ display: 'flex', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div className="field-group" style={{ minWidth: '240px', marginBottom: 0 }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Filter by Status</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: '#fff', fontSize: '0.92rem' }}
          >
            <option value="All">All Applications</option>
            <option value="Under Sponsor review">Needs Review</option>
            <option value="Approved">Approved</option>
            <option value="Grant Disbursed">Grant Disbursed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {uniqueSponsorships.length > 0 && (
          <div className="field-group" style={{ minWidth: '260px', marginBottom: 0 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Filter by Opportunity</label>
            <select 
              value={filterSponsorship} 
              onChange={(e) => setFilterSponsorship(e.target.value)} 
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: '#fff', fontSize: '0.92rem' }}
            >
              <option value="All">All Opportunities</option>
              {uniqueSponsorships.map((sp) => (
                <option key={sp._id} value={sp._id}>{sp.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>Applicant</th>
              <th style={{ width: '22%' }}>Opportunity</th>
              <th style={{ width: '16%' }}>Tuition Grant</th>
              <th style={{ width: '13%' }}>Submitted On</th>
              <th style={{ width: '12%' }}>Status</th>
              <th style={{ width: '15%', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-ink-soft)' }}>
                  No applications match your active filters.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app._id}>
                  <td>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>{app.student?.name || 'Applicant'}</strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', marginTop: '2px' }}>{app.student?.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{app.sponsorship?.title}</div>
                  </td>
                  <td>
                    <strong style={{ color: '#166534', fontSize: '0.98rem' }}>
                      ₦{(app.sponsorship?.grantAmount || 250000).toLocaleString()}
                    </strong>
                  </td>
                  <td style={{ color: 'var(--color-ink-soft)', whiteSpace: 'nowrap' }}>
                    {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(app.status)}`}>
                      {app.status === 'Under Sponsor review' ? 'Needs Review' : app.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {app.status === 'Approved' && (
                        <button 
                          type="button"
                          className="primary-button" 
                          onClick={() => setDisburseApp(app)}
                          style={{ padding: '6px 12px', fontSize: '0.82rem', background: '#0ba4db', borderColor: '#0ba4db', color: '#fff', fontWeight: 600 }}
                        >
                          💳 Disburse (Paystack)
                        </button>
                      )}

                      {app.status === 'Grant Disbursed' && (
                        <button 
                          type="button"
                          className="secondary-button" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewReceiptAppId(app._id)
                          }}
                          style={{ padding: '6px 12px', fontSize: '0.82rem', borderColor: '#2e7d32', color: '#2e7d32', fontWeight: 600 }}
                        >
                          🧾 Receipt
                        </button>
                      )}

                      <button 
                        className="secondary-button" 
                        onClick={() => setSelectedApp(app)}
                        style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '6px' }}
                      >
                        Inspect
                      </button>
                    </div>
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
                <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Application Review</h3>
                <p className="section-meta" style={{ fontSize: '0.85rem' }}>Detailed student submission dossier</p>
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
                  <div><strong>Name:</strong> {selectedApp.student?.name}</div>
                  <div><strong>Email:</strong> {selectedApp.student?.email}</div>
                  <div><strong>Programme:</strong> {selectedApp.academicInfoSnapshot?.programme || 'N/A'}</div>
                  <div><strong>Level:</strong> {selectedApp.academicInfoSnapshot?.level || 'N/A'}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px', fontWeight: 700 }}>
                  Sponsorship Opportunity
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                  <div><strong>Opportunity:</strong> {selectedApp.sponsorship?.title}</div>
                  <div>
                    <strong>Tuition Grant:</strong>{' '}
                    <span style={{ color: '#166534', fontWeight: 700 }}>
                      ₦{(selectedApp.sponsorship?.grantAmount || 250000).toLocaleString()}
                    </span>
                  </div>
                  <div><strong>Current Status:</strong> <span className={`status-badge ${selectedApp.status === 'Approved' ? 'status-active' : selectedApp.status === 'Rejected' ? 'status-closed' : 'status-warning'}`}>{selectedApp.status}</span></div>
                  <div><strong>Applied On:</strong> {new Date(selectedApp.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>
                Reason for Requesting Sponsorship
              </h4>
              <div style={{ background: '#fff', border: '1px solid var(--color-border)', padding: '16px 20px', borderRadius: '10px', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedApp.reasonForRequesting || 'No reason provided.'}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', fontWeight: 700 }}>
                Submitted Verification Documents
              </h4>
              {selectedApp.documents?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedApp.documents.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', padding: '12px 18px', borderRadius: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📄 {doc.type}</span>
                      <a 
                        href={doc.cloudinaryUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ fontSize: '0.88rem', color: 'var(--color-accent-strong, #5b3a2b)', fontWeight: 600, textDecoration: 'underline' }}
                      >
                        View Document ↗
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: 'var(--color-ink-soft)' }}>No verification documents attached.</p>
              )}
            </div>

            {selectedApp.status === 'Under Sponsor review' && (
              <div style={{ borderTop: '2px solid var(--color-border)', paddingTop: '24px', marginTop: '20px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '14px', fontWeight: 700 }}>Make a Decision</h4>
                <div className="field-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Review Note / Reason (Required if requesting information or rejecting)</label>
                  <input
                    type="text"
                    placeholder="e.g. Please upload your most recent semester transcript or identity confirmation."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.95rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <button 
                    className="primary-button" 
                    style={{ background: '#d32f2f', color: '#fff', border: 'none', flex: 1, minWidth: '130px', padding: '12px', borderRadius: '8px', fontWeight: 600 }} 
                    onClick={() => handleDecision(selectedApp._id, 'reject')}
                  >
                    Reject
                  </button>
                  <button 
                    className="primary-button" 
                    style={{ background: '#d97706', color: '#fff', border: 'none', flex: 1, minWidth: '130px', padding: '12px', borderRadius: '8px', fontWeight: 600 }} 
                    onClick={() => handleDecision(selectedApp._id, 'request_info')}
                  >
                    Request Info
                  </button>
                  <button 
                    className="primary-button" 
                    style={{ background: '#2e7d32', color: '#fff', border: 'none', flex: 1, minWidth: '140px', padding: '12px', borderRadius: '8px', fontWeight: 600 }} 
                    onClick={() => handleDecision(selectedApp._id, 'approve')}
                  >
                    Approve
                  </button>
                  <button 
                    className="primary-button" 
                    style={{ background: '#0ba4db', color: '#fff', border: 'none', flex: 1.3, minWidth: '180px', padding: '12px', borderRadius: '8px', fontWeight: 700 }} 
                    onClick={async () => {
                      const appToDisburse = selectedApp
                      setSelectedApp(null)
                      await handleDecision(selectedApp._id, 'approve')
                      setDisburseApp({ ...appToDisburse, status: 'Approved' })
                    }}
                  >
                    💳 Approve & Disburse
                  </button>
                </div>
              </div>
            )}
            
            {selectedApp.status === 'Approved' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px 20px', borderRadius: '10px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#166534', fontSize: '1rem' }}>Application Approved — Ready for Disbursement</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
                    Disburse the educational tuition grant of <strong>₦{(selectedApp.sponsorship?.grantAmount || 250000).toLocaleString()}</strong> directly via Paystack.
                  </p>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  style={{ background: '#0ba4db', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700 }}
                  onClick={() => {
                    const target = selectedApp
                    setSelectedApp(null)
                    setDisburseApp(target)
                  }}
                >
                  Disburse via Paystack
                </button>
              </div>
            )}

            {selectedApp.status === 'Grant Disbursed' && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px 20px', borderRadius: '10px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', color: '#166534', fontSize: '1rem' }}>✓ Tuition Grant Disbursed</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803d' }}>
                    Tuition funds have been settled and logged via Paystack.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', borderColor: '#2e7d32', color: '#2e7d32' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewReceiptAppId(selectedApp._id)
                  }}
                >
                  View Payment Receipt
                </button>
              </div>
            )}

            {selectedApp.status === 'Rejected' && selectedApp.rejectionReason && (
              <div style={{ background: '#fee2e2', padding: '16px 20px', borderRadius: '10px', marginTop: '20px', color: '#991b1b', border: '1px solid #fecaca' }}>
                <strong>Rejection Reason:</strong> {selectedApp.rejectionReason}
              </div>
            )}
          </div>
        </div>
      )}

      {disburseApp && (
        <PaystackDisbursementModal
          application={disburseApp}
          onClose={() => setDisburseApp(null)}
          onSuccess={(paidAppId) => {
            fetchApplications()
            setDisburseApp(null)
            setViewReceiptAppId(paidAppId || disburseApp._id)
          }}
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
