import { useState } from 'react'

export default function SponsorProfile() {
  const [isEditing, setIsEditing] = useState(false)

  const [profile, setProfile] = useState({
    orgName: 'Apex Education Foundation',
    contactPerson: 'Dr. Marcus Vance',
    email: 'sponsor@example.com',
    phone: '+234 (1) 892-4410',
    website: 'https://apexeducation.org',
    location: 'Lagos, Nigeria',
    category: 'Non-Profit / Education Trust',
    description:
      'Apex Education Foundation empowers high-performing university students across Africa through targeted STEM tuition grants, technology access, and mentorship.',
    focusAreas: 'Computer Science, Electrical Engineering, Biotechnology, Mathematics',
    annualGrantBudget: '$100,000 USD',
  })

  const [editData, setEditData] = useState(profile)

  function handleEditChange(field, value) {
    setEditData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSaveChanges() {
    setProfile(editData)
    setIsEditing(false)
    alert('Organization profile updated successfully!')
  }

  function handleCancelEdit() {
    setEditData(profile)
    setIsEditing(false)
  }

  return (
    <div className="student-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">AF</div>
        </div>
        <div className="profile-title">
          <h2>{profile.orgName}</h2>
          <p className="profile-meta">
            {profile.category} • {profile.location}
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {/* Organization Information */}
        <section className="profile-section card">
          <h3>Organization Overview</h3>

          {isEditing ? (
            <div className="form-grid">
              <div className="field-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={editData.orgName}
                  onChange={(e) => handleEditChange('orgName', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  value={editData.contactPerson}
                  onChange={(e) => handleEditChange('contactPerson', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Contact Email</label>
                <input type="email" value={editData.email} disabled />
              </div>
              <div className="field-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Website</label>
                <input
                  type="text"
                  value={editData.website}
                  onChange={(e) => handleEditChange('website', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Headquarters / Location</label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => handleEditChange('location', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Contact Person</span>
                <span className="value">{profile.contactPerson}</span>
              </div>
              <div className="info-item">
                <span className="label">Official Email</span>
                <span className="value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone</span>
                <span className="value">{profile.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Website</span>
                <span className="value">{profile.website}</span>
              </div>
              <div className="info-item">
                <span className="label">Location</span>
                <span className="value">{profile.location}</span>
              </div>
              <div className="info-item">
                <span className="label">Category</span>
                <span className="value">{profile.category}</span>
              </div>
            </div>
          )}
        </section>

        {/* Mission & Focus Areas */}
        <section className="profile-section card">
          <h3>Sponsorship Scope & Focus</h3>

          {isEditing ? (
            <div className="form-grid">
              <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                <label>Mission Statement</label>
                <textarea
                  rows="3"
                  value={editData.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Primary Focus Disciplines</label>
                <input
                  type="text"
                  value={editData.focusAreas}
                  onChange={(e) => handleEditChange('focusAreas', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Annual Grant Allocation</label>
                <input
                  type="text"
                  value={editData.annualGrantBudget}
                  onChange={(e) => handleEditChange('annualGrantBudget', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div>
              <p className="bio-text" style={{ marginBottom: '16px' }}>
                {profile.description}
              </p>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Focus Areas</span>
                  <span className="value">{profile.focusAreas}</span>
                </div>
                <div className="info-item">
                  <span className="label">Annual Grant Pool</span>
                  <span className="value">{profile.annualGrantBudget}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Security & Organization Verification */}
        <section className="profile-section card">
          <h3>Sponsor Verification & Security</h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(61, 107, 77, 0.08)',
              border: '1px solid rgba(61, 107, 77, 0.25)',
              borderRadius: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--color-success)' }}>
                ✓ Certified Sponsor Organization
              </strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', margin: '2px 0 0' }}>
                Corporate identity and institutional bank accounts verified by system administrator.
              </p>
            </div>
            <span className="badge badge-success">Verified</span>
          </div>

          <div className="settings-list">
            <button type="button" className="settings-item">
              <span>Organization Password & 2FA</span>
              <span className="arrow">→</span>
            </button>
            <button type="button" className="settings-item">
              <span>Manage Sponsor Team Members</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="edit-actions">
          <button type="button" className="secondary-button" onClick={handleCancelEdit}>
            Cancel
          </button>
          <button type="button" className="primary-button" onClick={handleSaveChanges}>
            Save Organization Details
          </button>
        </div>
      )}
    </div>
  )
}

