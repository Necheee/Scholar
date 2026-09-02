import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentSponsorships() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    search: '',
    amount: 'all',
    category: 'all',
    status: 'all',
  })

  // Mock sponsorship data
  const sponsorships = [
    {
      id: 'opp-001',
      title: 'STEM Excellence Award',
      sponsor: 'TechForward Foundation',
      amount: 50000,
      category: 'STEM',
      description: 'Full tuition + living expenses for STEM majors with 3.5+ GPA',
      deadline: '2026-09-30',
      applicants: 42,
      status: 'Open',
    },
    {
      id: 'opp-002',
      title: 'Global Leaders Initiative',
      sponsor: 'International Partnerships Ltd',
      amount: 75000,
      category: 'Leadership',
      description: 'Competitive sponsorship for future leaders in international affairs',
      deadline: '2026-10-15',
      applicants: 28,
      status: 'Open',
    },
    {
      id: 'opp-003',
      title: 'Full Tuition + Living Expenses',
      sponsor: 'Merit Foundation',
      amount: 80000,
      category: 'General',
      description: 'Merit-based full sponsorship for high-performing students',
      deadline: '2026-09-20',
      applicants: 156,
      status: 'Open',
    },
    {
      id: 'opp-004',
      title: 'Healthcare Professionals Scholarship',
      sponsor: 'Health Futures Foundation',
      amount: 45000,
      category: 'Healthcare',
      description: 'Sponsorship for students pursuing healthcare careers',
      deadline: '2026-10-01',
      applicants: 34,
      status: 'Open',
    },
    {
      id: 'opp-005',
      title: 'Arts & Humanities Grant',
      sponsor: 'Creative Minds Fund',
      amount: 30000,
      category: 'Arts',
      description: 'Support for students in creative fields and humanities',
      deadline: '2026-09-25',
      applicants: 19,
      status: 'Open',
    },
  ]

  const filteredSponsorships = sponsorships.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          opp.sponsor.toLowerCase().includes(filters.search.toLowerCase())
    const matchesAmount = filters.amount === 'all' || 
                          (filters.amount === 'high' && opp.amount >= 50000) ||
                          (filters.amount === 'medium' && opp.amount >= 30000 && opp.amount < 50000) ||
                          (filters.amount === 'low' && opp.amount < 30000)
    const matchesCategory = filters.category === 'all' || opp.category === filters.category
    const matchesStatus = filters.status === 'all' || opp.status === filters.status

    return matchesSearch && matchesAmount && matchesCategory && matchesStatus
  })

  return (
    <div className="sponsorships-browser">
      {/* Filters */}
      <section className="filters-section">
        <div className="filters-header">
          <h3>Filter Opportunities</h3>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Sponsorship name or sponsor..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Award Amount</label>
            <select
              value={filters.amount}
              onChange={(e) => setFilters({ ...filters, amount: e.target.value })}
              className="filter-select"
            >
              <option value="all">All amounts</option>
              <option value="high">$50,000+</option>
              <option value="medium">$30,000 - $50,000</option>
              <option value="low">Under $30,000</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="filter-select"
            >
              <option value="all">All categories</option>
              <option value="STEM">STEM</option>
              <option value="Leadership">Leadership</option>
              <option value="General">General</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Arts">Arts & Humanities</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="filter-select"
            >
              <option value="all">All statuses</option>
              <option value="Open">Open</option>
              <option value="Closing Soon">Closing Soon</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="results-section">
        <div className="results-header">
          <h3>Sponsorships ({filteredSponsorships.length})</h3>
          <p className="results-meta">Showing {filteredSponsorships.length} of {sponsorships.length} opportunities</p>
        </div>

        {filteredSponsorships.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🔍</p>
            <h4>No sponsorships found</h4>
            <p>Try adjusting your filters to find opportunities</p>
          </div>
        ) : (
          <div className="sponsorships-list">
            {filteredSponsorships.map((opp) => (
              <div key={opp.id} className="sponsorship-card card">
                <div className="sponsorship-header">
                  <div>
                    <h4>{opp.title}</h4>
                    <p className="sponsor-name">{opp.sponsor}</p>
                  </div>
                  <div className="sponsorship-meta">
                    <span className="category-badge">{opp.category}</span>
                    <span className="status-badge status-open">{opp.status}</span>
                  </div>
                </div>

                <p className="sponsorship-description">{opp.description}</p>

                <div className="sponsorship-details">
                  <div className="detail-item">
                    <span className="detail-label">Award Amount</span>
                    <span className="detail-value">${(opp.amount / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deadline</span>
                    <span className="detail-value">{opp.deadline}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Applications</span>
                    <span className="detail-value">{opp.applicants}</span>
                  </div>
                </div>

                <button
                  className="primary-button"
                  onClick={() => navigate(`/student/sponsorships/${opp.id}`)}
                >
                  View & Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
