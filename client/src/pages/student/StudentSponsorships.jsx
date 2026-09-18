import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function StudentSponsorships() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    search: '',
  })
  const [sponsorships, setSponsorships] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSponsorships()
  }, [])

  async function fetchSponsorships() {
    try {
      setIsLoading(true)
      const { data } = await api.get('/sponsorships')
      setSponsorships(data)
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>Duration</div>
                    <div style={{ fontWeight: 600 }}>{opp.duration || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>Deadline</div>
                    <div style={{ fontWeight: 600 }}>{new Date(opp.applicationDeadline).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <button
                  className="primary-button"
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/student/apply/${opp._id}`, { state: { sponsorship: opp } })}
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
