import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialOpportunities = [
  {
    id: 'sp-01',
    title: 'STEM Excellence Scholarship',
    description: 'Comprehensive financial support for outstanding students in Engineering, Computer Science, and Mathematics.',
    awardAmount: '$5,000 / session',
    duration: 'Full Degree (4 Years)',
    eligibility: 'Open to full-time 200L–400L STEM undergraduates with demonstrated academic achievement.',
    academicReqs: 'Minimum GPA of 3.5 on a 4.0 scale (or equivalent).',
    requiredDocs: ['Academic Transcript', 'Student ID Card', 'Statement of Purpose'],
    deadline: '2026-10-15',
    applicantsCount: 14,
    status: 'Active',
  },
  {
    id: 'sp-02',
    title: 'Future Tech Leaders Grant',
    description: 'Aimed at emerging software developers, AI researchers, and technical innovators needing tuition backing.',
    awardAmount: '$3,500 / session',
    duration: '2 Academic Sessions',
    eligibility: 'Open to Nigerian university students in Computer Science and Technology-related disciplines.',
    academicReqs: 'Minimum GPA of 3.2 on a 4.0 scale.',
    requiredDocs: ['Transcript', 'National ID / Passport', 'Portfolio / GitHub link'],
    deadline: '2026-10-30',
    applicantsCount: 8,
    status: 'Active',
  },
  {
    id: 'sp-03',
    title: 'Undergraduate Innovation Fund',
    description: 'Grant supporting undergraduate final-year research projects addressing real-world community challenges.',
    awardAmount: '$2,000 one-time',
    duration: 'Final Year Only',
    eligibility: 'Final year undergraduate students currently working on an innovative capstone or final-year thesis.',
    academicReqs: 'Minimum GPA of 3.0 on a 4.0 scale.',
    requiredDocs: ['Project Proposal', 'Transcript', 'Supervisor Letter of Support'],
    deadline: '2026-11-15',
    applicantsCount: 0,
    status: 'Active',
  },
  {
    id: 'sp-04',
    title: '2025/2026 Merit Bursary',
    description: 'Annual scholarship award for first-generation university scholars.',
    awardAmount: '$1,500 one-time',
    duration: '1 Session',
    eligibility: 'First-generation students entering 100L or 200L.',
    academicReqs: 'Minimum GPA of 3.0 on a 4.0 scale.',
    requiredDocs: ['Transcript', 'Birth Certificate / State of Origin ID'],
    deadline: '2026-08-01',
    applicantsCount: 22,
    status: 'Closed',
  },
]

export default function SponsorOpportunities() {
  const navigate = useNavigate()
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [filterStatus, setFilterStatus] = useState('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)
  const [extendingDeadlineOpp, setExtendingDeadlineOpp] = useState(null)
  const [newDeadline, setNewDeadline] = useState('')

  // Form state for creating a new opportunity
  const [formData, setFormData] = useState({
    title: '',
    awardAmount: '',
    duration: '1 Academic Session',
    deadline: '',
    description: '',
    eligibility: '',
    academicReqs: '',
    requiredDocs: 'Transcript, Identification Document, Statement of Purpose',
  })

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleCreateOpportunity(e) {
    e.preventDefault()
    if (!formData.title || !formData.awardAmount || !formData.deadline) {
      alert('Please fill in all required fields.')
      return
    }

    const newOpp = {
      id: `sp-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      awardAmount: formData.awardAmount,
      duration: formData.duration,
      eligibility: formData.eligibility,
      academicReqs: formData.academicReqs,
      requiredDocs: formData.requiredDocs.split(',').map((s) => s.trim()),
      deadline: formData.deadline,
      applicantsCount: 0, // Starts with 0 applicants (editable)
      status: 'Active',
    }

    setOpportunities([newOpp, ...opportunities])
    setIsCreateModalOpen(false)
    setFormData({
      title: '',
      awardAmount: '',
      duration: '1 Academic Session',
      deadline: '',
      description: '',
      eligibility: '',
      academicReqs: '',
      requiredDocs: 'Transcript, Identification Document, Statement of Purpose',
    })
    alert('Sponsorship opportunity published successfully! Students can now apply.')
  }

  function handleSaveEdit(e) {
    e.preventDefault()
    if (!editingOpportunity) return

    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === editingOpportunity.id ? editingOpportunity : opp))
    )
    setEditingOpportunity(null)
    alert('Sponsorship details updated successfully.')
  }

  function handleSaveExtendedDeadline(e) {
    e.preventDefault()
    if (!extendingDeadlineOpp || !newDeadline) return

    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === extendingDeadlineOpp.id
          ? { ...opp, deadline: newDeadline, status: 'Active' }
          : opp
      )
    )
    setExtendingDeadlineOpp(null)
    setNewDeadline('')
    alert('Application deadline extended successfully.')
  }

  const filtered = opportunities.filter((opp) => {
    if (filterStatus === 'Active') return opp.status === 'Active'
    if (filterStatus === 'Closed') return opp.status === 'Closed'
    return true
  })

  return (
    <div className="sponsorships-browser">
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>My Sponsorship Opportunities</h2>
          <p className="section-meta">
            Create and maintain your funding opportunities, track applicant volume, and manage deadlines.
          </p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create New Sponsorship
        </button>
      </div>

      {/* Filter Tabs */}
      <section className="filters-section" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ink)' }}>
            Filter by status:
          </span>
          {['All', 'Active', 'Closed'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={filterStatus === tab ? 'primary-button' : 'secondary-button'}
              style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              onClick={() => setFilterStatus(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Opportunities List */}
      <section className="results-section">
        <div className="sponsorships-list">
          {filtered.map((opp) => {
            const isLocked = opp.applicantsCount > 0
            const isClosed = opp.status === 'Closed'

            return (
              <div key={opp.id} className="sponsorship-card card">
                <div className="sponsorship-header">
                  <div>
                    <h4>{opp.title}</h4>
                    <p className="card-meta">
                      Award: <strong>{opp.awardAmount}</strong> • Duration: {opp.duration}
                    </p>
                  </div>
                  <div className="sponsorship-meta">
                    <span
                      className={`badge ${
                        isClosed
                          ? 'badge-warning'
                          : isLocked
                          ? 'badge-info'
                          : 'badge-success'
                      }`}
                    >
                      {opp.status}
                    </span>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: isLocked ? 'rgba(74, 58, 50, 0.1)' : 'rgba(61, 107, 77, 0.15)',
                        color: isLocked ? 'var(--color-ink-soft)' : 'var(--color-success)',
                      }}
                    >
                      {isLocked ? '🔒 Locked for Editing' : '✏️ Editable'}
                    </span>
                  </div>
                </div>

                <p className="sponsorship-description">{opp.description}</p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    margin: '14px 0',
                    fontSize: '0.88rem',
                    color: 'var(--color-ink-soft)',
                  }}
                >
                  <div>
                    <strong>Eligibility:</strong> {opp.eligibility}
                  </div>
                  <div>
                    <strong>Academic Requirement:</strong> {opp.academicReqs}
                  </div>
                </div>

                {/* Status Notice according to DEC-008 */}
                {isLocked ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', margin: '8px 0 16px' }}>
                    ℹ️ <strong>Rule DEC-008:</strong> This sponsorship has received{' '}
                    <strong>{opp.applicantsCount} application(s)</strong>. Details are locked to protect applicant trust. You may still extend the deadline.
                  </p>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-success)', margin: '8px 0 16px' }}>
                    ✓ No applications received yet. You may freely edit all criteria and award details.
                  </p>
                )}

                <div className="sponsorship-details">
                  <div className="detail-item">
                    <span className="detail-label">Applications Received</span>
                    <span className="detail-value">{opp.applicantsCount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Application Deadline</span>
                    <span className="detail-value">{opp.deadline}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Required Documents</span>
                    <span className="detail-value">{opp.requiredDocs.join(', ')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  {/* View Applications */}
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => navigate('/sponsor/applications')}
                  >
                    View Applications ({opp.applicantsCount})
                  </button>

                  {/* Edit action if 0 applicants */}
                  {!isLocked && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setEditingOpportunity({ ...opp })}
                    >
                      ✏️ Edit Opportunity
                    </button>
                  )}

                  {/* Extend deadline action if locked */}
                  {isLocked && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setExtendingDeadlineOpp(opp)
                        setNewDeadline(opp.deadline)
                      }}
                    >
                      📅 Extend Deadline
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Modal: Create Sponsorship Opportunity */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 23, 19, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Create Sponsorship Opportunity</h3>
              <button
                type="button"
                className="action-button"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="auth-form">
              <div className="field-group">
                <label>Sponsorship Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Merit Scholars Fellowship 2026"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field-group">
                  <label>Award Amount / Value *</label>
                  <input
                    type="text"
                    name="awardAmount"
                    placeholder="e.g. $5,000 / session"
                    value={formData.awardAmount}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Duration *</label>
                  <select name="duration" value={formData.duration} onChange={handleFormChange}>
                    <option value="1 Academic Session">1 Academic Session</option>
                    <option value="2 Academic Sessions">2 Academic Sessions</option>
                    <option value="Full Degree (4 Years)">Full Degree (4 Years)</option>
                    <option value="One-time Grant">One-time Grant</option>
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Application Deadline *</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="field-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Explain the purpose and goals of this funding opportunity..."
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="field-group">
                <label>Eligibility Requirements *</label>
                <input
                  type="text"
                  name="eligibility"
                  placeholder="e.g. Open to full-time 200L–400L undergraduates"
                  value={formData.eligibility}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="field-group">
                <label>Academic Requirements (Minimum GPA / Level)</label>
                <input
                  type="text"
                  name="academicReqs"
                  placeholder="e.g. Minimum GPA of 3.5 on a 4.0 scale"
                  value={formData.academicReqs}
                  onChange={handleFormChange}
                />
              </div>

              <div className="field-group">
                <label>Required Documents (comma-separated)</label>
                <input
                  type="text"
                  name="requiredDocs"
                  placeholder="Transcript, National ID, Statement of Purpose"
                  value={formData.requiredDocs}
                  onChange={handleFormChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Publish Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Opportunity (Allowed only if 0 applicants) */}
      {editingOpportunity && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 23, 19, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Edit Sponsorship Opportunity</h3>
              <button
                type="button"
                className="action-button"
                onClick={() => setEditingOpportunity(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="auth-form">
              <div className="field-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingOpportunity.title}
                  onChange={(e) =>
                    setEditingOpportunity({ ...editingOpportunity, title: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field-group">
                  <label>Award Amount</label>
                  <input
                    type="text"
                    value={editingOpportunity.awardAmount}
                    onChange={(e) =>
                      setEditingOpportunity({ ...editingOpportunity, awardAmount: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="field-group">
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={editingOpportunity.deadline}
                    onChange={(e) =>
                      setEditingOpportunity({ ...editingOpportunity, deadline: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingOpportunity.description}
                  onChange={(e) =>
                    setEditingOpportunity({ ...editingOpportunity, description: e.target.value })
                  }
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditingOpportunity(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Extend Deadline (For locked sponsorships) */}
      {extendingDeadlineOpp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 23, 19, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '14px' }}>
              <h3>Extend Deadline</h3>
              <button
                type="button"
                className="action-button"
                onClick={() => setExtendingDeadlineOpp(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', marginBottom: '16px' }}>
              Extend the application deadline for <strong>{extendingDeadlineOpp.title}</strong>. Other details are locked because applications have already been submitted.
            </p>

            <form onSubmit={handleSaveExtendedDeadline} className="auth-form">
              <div className="field-group">
                <label>Current Deadline</label>
                <input type="text" value={extendingDeadlineOpp.deadline} disabled />
              </div>

              <div className="field-group">
                <label>New Application Deadline *</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setExtendingDeadlineOpp(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save New Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

