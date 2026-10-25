import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import PaymentReceiptModal from '../../components/PaymentReceiptModal'
import StudentDocumentUploadModal from '../../components/StudentDocumentUploadModal'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [stats, setStats] = useState({
    activeApplications: 0,
    sponsorshipsAvailable: 0,
    awarded: 0
  })
  
  const [activeApp, setActiveApp] = useState(null)
  const [activeGrant, setActiveGrant] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewReceiptAppId, setViewReceiptAppId] = useState(null)
  const [pendingDocRequests, setPendingDocRequests] = useState([])
  const [activeUploadRequest, setActiveUploadRequest] = useState(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [sponsorshipsRes, applicationsRes, docRequestsRes] = await Promise.all([
        api.get('/sponsorships'),
        api.get('/applications/my-applications'),
        api.get('/document-requests/my-requests').catch(() => ({ data: [] })),
      ])

      const sponsorships = sponsorshipsRes.data
      const applications = applicationsRes.data
      const docRequests = docRequestsRes.data || []

      const activeApplication = applications.find(a => 
        a.status !== 'Rejected' && a.status !== 'Approved' && a.status !== 'Grant Disbursed' && a.status !== 'Withdrawn'
      )

      const currentFundedGrant = applications.find(a => a.status === 'Grant Disbursed' || a.fundingStatus?.isFundedActive)
      
      const awarded = applications.filter(a => a.status === 'Approved' || a.status === 'Grant Disbursed').length

      const pendingRequests = docRequests.filter(r => r.status === 'Pending')

      setStats({
        activeApplications: activeApplication ? 1 : 0,
        sponsorshipsAvailable: sponsorships.length,
        awarded: awarded
      })

      setActiveApp(activeApplication || null)
      setActiveGrant(currentFundedGrant || null)
      setPendingDocRequests(pendingRequests)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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

      {/* Action Required: Sponsor Document Request Banner */}
      {pendingDocRequests.length > 0 && (
        <div
          className="card"
          style={{
            background: '#fffaf0',
            border: '1px solid #fef3c7',
            borderLeft: '5px solid #d97706',
            padding: '20px 24px',
            marginBottom: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.25rem' }}>📑</span>
                <h4 style={{ margin: 0, color: '#92400e', fontSize: '1.1rem', fontWeight: 700 }}>
                  Document Request from {pendingDocRequests[0].sponsor?.name || 'Sponsor'}
                </h4>
                <span
                  className="badge"
                  style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}
                >
                  Action Required
                </span>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '0.92rem', color: '#78350f' }}>
                <strong>Requested Documents:</strong> {pendingDocRequests[0].requestedDocuments?.join(', ')}
              </p>
              {pendingDocRequests[0].message && (
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-ink-soft)', fontStyle: 'italic' }}>
                  "{pendingDocRequests[0].message}"
                </p>
              )}
            </div>
            <button
              type="button"
              className="primary-button"
              style={{
                background: '#d97706',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                padding: '12px 22px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
              }}
              onClick={() => setActiveUploadRequest(pendingDocRequests[0])}
            >
              Upload Requested Documents
            </button>
          </div>
        </div>
      )}

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
              </div>
              <span className="status-badge status-active">
                {activeApp.status}
              </span>
            </div>
            
            <div style={{ background: 'var(--color-paper-border)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Tuition Grant Value:</span>
                <strong style={{ color: '#166534', fontWeight: 700 }}>₦{(activeApp.sponsorship?.grantAmount || 250000).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Submitted on:</span>
                <strong>{new Date(activeApp.createdAt).toLocaleDateString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Current Stage:</span>
                <strong>
                  {activeApp.status === 'Under screening' ? 'Automated Review (Fraud Engine)' :
                   activeApp.status === 'Under Admin review' ? 'Manual Admin Review' :
                   activeApp.status === 'Under Sponsor review' ? 'Final Sponsor Review' : 
                   activeApp.status === 'Waiting for additional information' ? 'Action Required: Submit Documents' : 'Processing'}
                </strong>
              </div>
            </div>
            
            <button 
              className="secondary-button" 
              style={{ alignSelf: 'flex-start' }}
              onClick={() => navigate('/student/history')}
            >
              View Full History
            </button>
          </div>
        ) : activeGrant ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#166534' }}>
                  ✓ {activeGrant.sponsorship?.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                  Active Educational Scholarship Grant
                </p>
              </div>
              <span className="status-badge status-active">
                Funded & Active
              </span>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Grant Disbursed:</span>
                <strong style={{ color: '#166534', fontWeight: 700, fontSize: '1.05rem' }}>
                  ₦{(activeGrant.sponsorship?.grantAmount || 250000).toLocaleString()}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Funded Duration:</span>
                <strong>{activeGrant.sponsorship?.duration || '1 Academic Session'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-ink-soft)' }}>Disbursed On:</span>
                <strong>{new Date(activeGrant.fundingStatus?.startDate || activeGrant.disbursedAt || activeGrant.updatedAt).toLocaleDateString()}</strong>
              </div>
              {activeGrant.fundingStatus?.endDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #bbf7d0', fontSize: '0.9rem' }}>
                  <span style={{ color: '#166534', fontWeight: 600 }}>Next Eligible Application Date:</span>
                  <strong style={{ color: '#15803d' }}>
                    {new Date(activeGrant.fundingStatus.endDate).toLocaleDateString()} ({activeGrant.fundingStatus?.daysRemaining || 0} days left)
                  </strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="secondary-button" 
                style={{ borderColor: '#2e7d32', color: '#2e7d32', fontWeight: 600 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setViewReceiptAppId(activeGrant._id)
                }}
              >
                🧾 View Receipt
              </button>
              <button 
                className="secondary-button" 
                onClick={() => navigate('/student/history')}
              >
                Full History
              </button>
              <button 
                className="primary-button" 
                onClick={() => navigate('/student/sponsorships')}
              >
                Browse Upcoming Opportunities
              </button>
            </div>
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

      {/* Upload Requested Documents Modal */}
      {activeUploadRequest && (
        <StudentDocumentUploadModal
          docRequest={activeUploadRequest}
          onClose={() => setActiveUploadRequest(null)}
          onSuccess={() => {
            fetchDashboardData()
            alert('Documents submitted successfully to sponsor!')
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
