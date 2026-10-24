import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function StudentSponsorships() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    search: '',
  })
  const [sponsorships, setSponsorships] = useState([])
  const [activeGrant, setActiveGrant] = useState(null)
  const [activeReviewApp, setActiveReviewApp] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      const [sponsorshipsRes, appsRes] = await Promise.all([
        api.get('/sponsorships'),
        api.get('/applications/my-applications')
      ])
      setSponsorships(sponsorshipsRes.data)
      const currentGrant = appsRes.data.find(a => a.fundingStatus?.isFundedActive)
      const pendingApp = appsRes.data.find(a => 
        ['Draft', 'Submitted', 'Under screening', 'Under Admin review', 'Waiting for additional information', 'Under Sponsor review'].includes(a.status)
      )
      setActiveGrant(currentGrant || null)
      setActiveReviewApp(pendingApp || null)
    } catch (error) {
      console.error('Failed to fetch sponsorships:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Derived filtered logic
  const filteredSponsorships = sponsorships.filter((s) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!s.title.toLowerCase().includes(q) && !s.sponsor?.name.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })

  if (isLoading) return <div>Loading sponsorships...</div>

  return (
    <div className="sponsorships-page">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Available Sponsorships</h2>
          <p className="section-meta">
            Browse and apply for scholarships, grants, and funding opportunities.
          </p>
        </div>
      </div>

      {activeGrant && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '1.6rem' }}>🎓</span>
          <div>
            <strong style={{ color: '#166534', fontSize: '1rem', display: 'block', marginBottom: '2px' }}>
              Active Scholarship Grant: {activeGrant.sponsorship?.title}
            </strong>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#15803d', lineHeight: 1.4 }}>
              Your current scholarship funding is active for <strong>{activeGrant.sponsorship?.duration || '1 Academic Session'}</strong> (ends on <strong>{new Date(activeGrant.fundingStatus?.endDate).toLocaleDateString()}</strong>, {activeGrant.fundingStatus?.daysRemaining} days remaining). You can browse open opportunities below to plan your next application.
            </p>
          </div>
        </div>
      )}

      {activeReviewApp && !activeGrant && (
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>⏳</span>
          <div style={{ fontSize: '0.88rem', color: '#854d0e' }}>
            You have an active application under review for <strong>{activeReviewApp.sponsorship?.title}</strong> ({activeReviewApp.status}). You can browse sponsorships, but new applications are locked until a decision is issued.
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="field-group" style={{ marginBottom: 0 }}>
          <label htmlFor="search">Search Opportunities</label>
          <input
            id="search"
            type="text"
            placeholder="Search by title or sponsor..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </div>
      </div>

      <div className="sponsorships-grid">
        {filteredSponsorships.length === 0 ? (
          <p style={{ color: 'var(--color-ink-soft)', gridColumn: '1 / -1' }}>
            No sponsorships found matching your criteria.
          </p>
        ) : (
          filteredSponsorships.map((opp) => (
            <div key={opp._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>{opp.title}</h3>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', fontWeight: 500 }}>
                  By: {opp.sponsor?.name || 'Unknown Sponsor'}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', marginBottom: '20px', flexGrow: 1 }}>
                {opp.description}
              </p>

              <div style={{ borderTop: '1px solid var(--color-paper-border)', paddingTop: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>Tuition Grant</div>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.95rem' }}>₦{(opp.grantAmount || 250000).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>Duration</div>
                    <div style={{ fontWeight: 600 }}>{opp.duration || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>Deadline</div>
                    <div style={{ fontWeight: 600 }}>{new Date(opp.applicationDeadline).toLocaleDateString()}</div>
                  </div>
                </div>
                
                {activeGrant ? (
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ width: '100%', borderColor: '#86efac', color: '#166534', background: '#f0fdf4', fontWeight: 600, fontSize: '0.88rem' }}
                    onClick={() => alert(`You are currently funded under "${activeGrant.sponsorship?.title}" until ${new Date(activeGrant.fundingStatus?.endDate).toLocaleDateString()} (${activeGrant.fundingStatus?.daysRemaining} days left). You will be eligible to submit your next application once this period concludes.`)}
                  >
                    ✓ Funded (Eligible {new Date(activeGrant.fundingStatus?.endDate).toLocaleDateString()})
                  </button>
                ) : activeReviewApp ? (
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ width: '100%', borderColor: '#fde047', color: '#854d0e', background: '#fefce8', fontWeight: 600, fontSize: '0.88rem' }}
                    onClick={() => navigate('/student/history')}
                  >
                    Application in Review →
                  </button>
                ) : (
                  <button
                    className="primary-button"
                    style={{ width: '100%' }}
                    onClick={() => navigate(`/student/application/${opp._id}`, { state: { sponsorship: opp } })}
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
