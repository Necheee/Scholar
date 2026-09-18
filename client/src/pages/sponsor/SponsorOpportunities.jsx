import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function SponsorOpportunities() {
  const navigate = useNavigate()
  const [opportunities, setOpportunities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)

  // Form state for creating a new opportunity
  const [formData, setFormData] = useState({
    title: '',
    duration: '1 Academic Session',
    applicationDeadline: '',
    description: '',
    eligibilityRequirements: '',
    academicRequirements: '',
    requiredDocuments: 'Transcript, Identification Document, Statement of Purpose',
  })

  useEffect(() => {
    fetchSponsorships()
  }, [])

  async function fetchSponsorships() {
    try {
      setIsLoading(true)
      const { data } = await api.get('/sponsorships')
      setOpportunities(data)
    } catch (error) {
      console.error('Failed to fetch sponsorships:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreateOpportunity(e) {
    e.preventDefault()
    if (!formData.title || !formData.applicationDeadline) {
      alert('Please fill in all required fields.')
      return
    }

    try {
      const payload = {
        ...formData,
        requiredDocuments: formData.requiredDocuments.split(',').map((s) => s.trim()),
      }
      
      const { data } = await api.post('/sponsorships', payload)
      
      setOpportunities([data, ...opportunities])
      setIsCreateModalOpen(false)
      setFormData({
        title: '',
        duration: '1 Academic Session',
        applicationDeadline: '',
        description: '',
        eligibilityRequirements: '',
        academicRequirements: '',
        requiredDocuments: 'Transcript, Identification Document, Statement of Purpose',
      })
      alert('Sponsorship created successfully!')
    } catch (error) {
      console.error('Failed to create sponsorship:', error)
      alert(error.response?.data?.message || 'Failed to create opportunity')
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    if (!editingOpportunity) return

    try {
      const { data } = await api.put(`/sponsorships/${editingOpportunity._id}`, {
        title: editingOpportunity.title,
        description: editingOpportunity.description,
        applicationDeadline: editingOpportunity.applicationDeadline
      })
      
      setOpportunities((prev) =>
        prev.map((opp) => (opp._id === data._id ? data : opp))
      )
      setEditingOpportunity(null)
      alert('Sponsorship details updated successfully.')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update opportunity')
    }
  }

  const filtered = opportunities.filter((opp) => {
    if (filterStatus === 'Active') return opp.status === 'Active'
    if (filterStatus === 'Closed') return opp.status === 'Closed'
    return true
  })

  if (isLoading) return <div>Loading opportunities...</div>

  return (
    <div className="sponsorships-browser">
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>My Sponsorship Opportunities</h2>
          <p className="section-meta">
            Create and maintain your funding opportunities, track applicant volume, and manage deadlines.
          </p>
        </div>
        <button className="primary-button" onClick={() => setIsCreateModalOpen(true)}>
          + New Opportunity
        </button>
      </div>

      <div className="filters-row" style={{ marginBottom: '20px' }}>
        <button
          className={filterStatus === 'All' ? 'active-filter' : 'inactive-filter'}
          onClick={() => setFilterStatus('All')}
        >
          All
        </button>
        <button
          className={filterStatus === 'Active' ? 'active-filter' : 'inactive-filter'}
          onClick={() => setFilterStatus('Active')}
        >
          Active
        </button>
        <button
          className={filterStatus === 'Closed' ? 'active-filter' : 'inactive-filter'}
          onClick={() => setFilterStatus('Closed')}
        >
          Closed
        </button>
      </div>

      <div className="sponsorships-grid">
        {filtered.map((opp) => {
          const isLocked = opp.isLocked

          return (
            <div key={opp._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-ink)' }}>{opp.title}</h3>
                <span className={`status-badge ${opp.status === 'Active' ? 'status-active' : 'status-closed'}`}>
                  {opp.status}
                </span>
              </div>
              
              <p style={{ color: 'var(--color-ink-soft)', flexGrow: 1, fontSize: '0.95rem' }}>
                {opp.description}
              </p>

              <div style={{ borderTop: '1px solid var(--color-paper-border)', marginTop: '16px', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Duration:</span>
                  <strong style={{ color: 'var(--color-ink)' }}>{opp.duration}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Deadline:</span>
                  <strong style={{ color: 'var(--color-ink)' }}>{new Date(opp.applicationDeadline).toLocaleDateString()}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="secondary-button"
                    style={{ flex: 1, fontSize: '0.85rem' }}
                    onClick={() => navigate('/sponsor/applications', { state: { sponsorshipId: opp._id } })}
                  >
                    View Apps
                  </button>
                  
                  {!isLocked ? (
                    <button
                      className="secondary-button"
                      style={{ flex: 1, fontSize: '0.85rem' }}
                      onClick={() => setEditingOpportunity(opp)}
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      className="secondary-button"
                      style={{ flex: 1, fontSize: '0.85rem', opacity: 0.5, cursor: 'not-allowed' }}
                      title="Applications have been received, so details are locked."
                      disabled
                    >
                      Locked
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Create New Sponsorship Opportunity</h3>
              <button type="button" className="action-button" onClick={() => setIsCreateModalOpen(false)}>X</button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="auth-form">
              <div className="field-group">
                <label>Opportunity Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleFormChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field-group">
                  <label>Duration *</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleFormChange} required />
                </div>
                <div className="field-group">
                  <label>Application Deadline *</label>
                  <input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleFormChange} required />
                </div>
              </div>

              <div className="field-group">
                <label>Description *</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleFormChange} required />
              </div>

              <div className="field-group">
                <label>Eligibility Requirements *</label>
                <input type="text" name="eligibilityRequirements" value={formData.eligibilityRequirements} onChange={handleFormChange} required />
              </div>

              <div className="field-group">
                <label>Academic Requirements (Minimum GPA / Level)</label>
                <input type="text" name="academicRequirements" value={formData.academicRequirements} onChange={handleFormChange} />
              </div>

              <div className="field-group">
                <label>Required Documents (comma-separated)</label>
                <input type="text" name="requiredDocuments" value={formData.requiredDocuments} onChange={handleFormChange} />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="secondary-button" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-button">Publish Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingOpportunity && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: '650px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Edit Sponsorship Opportunity</h3>
              <button type="button" className="action-button" onClick={() => setEditingOpportunity(null)}>X</button>
            </div>

            <form onSubmit={handleSaveEdit} className="auth-form">
              <div className="field-group">
                <label>Title</label>
                <input type="text" value={editingOpportunity.title} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, title: e.target.value })} required />
              </div>

              <div className="field-group">
                <label>Deadline</label>
                <input type="date" value={editingOpportunity.applicationDeadline ? new Date(editingOpportunity.applicationDeadline).toISOString().split('T')[0] : ''} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, applicationDeadline: e.target.value })} required />
              </div>

              <div className="field-group">
                <label>Description</label>
                <textarea rows="3" value={editingOpportunity.description} onChange={(e) => setEditingOpportunity({ ...editingOpportunity, description: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button type="button" className="secondary-button" onClick={() => setEditingOpportunity(null)}>Cancel</button>
                <button type="submit" className="primary-button">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
