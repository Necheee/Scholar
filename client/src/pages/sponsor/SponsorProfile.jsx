import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function SponsorProfile() {
  const { user, logout } = useAuth()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const getInitialProfile = () => ({
    orgName: user?.name || 'Apex Education Foundation',
    contactPerson: user?.name || 'Dr. Marcus Vance',
    email: user?.email || 'sponsor@example.com',
    phone: '+234 (1) 892-4410',
    website: 'https://apexeducation.org',
    location: 'Lagos, Nigeria',
    category: 'Non-Profit / Education Trust',
    description:
      'Apex Education Foundation empowers high-performing university students across Africa through targeted STEM tuition grants, technology access, and mentorship.',
    focusAreas: 'Computer Science, Electrical Engineering, Biotechnology, Mathematics',
    annualGrantBudget: '₦10,000,000',
  })

  const [profile, setProfile] = useState(getInitialProfile)
  const [editData, setEditData] = useState(getInitialProfile)

  useEffect(() => {
    const updated = getInitialProfile()
    setProfile(updated)
    setEditData(updated)
  }, [user])

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

  const handleChangePassword = async (e) => {
    e.preventDefault()
    try {
      await api.put('/auth/change-password', securityData)
      alert('Password updated successfully!')
      setShowPasswordModal(false)
      setSecurityData({ currentPassword: '', newPassword: '' })
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password')
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!deletePassword) {
      alert('Please enter your password to confirm account deletion.')
      return
    }
    try {
      setIsDeleting(true)
      await api.delete('/auth/delete-account', { data: { password: deletePassword } })
      alert('Your organization account has been permanently deleted.')
      logout()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete organization account')
    } finally {
      setIsDeleting(false)
    }
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
            <button type="button" className="settings-item" onClick={() => setShowPasswordModal(true)}><span>Organization Password & 2FA</span><span className="arrow">&#8594;</span></button>
            <button type="button" className="settings-item" onClick={() => alert('This feature is currently in development and will be available soon!')}>
              <span>Manage Sponsor Team Members</span>
              <span className="arrow">→</span>
            </button>
            <button type="button" className="settings-item danger" onClick={() => setShowDeleteModal(true)}>
              <span>Delete Organization Account</span>
              <span className="arrow">&#8594;</span>
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

      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Change Password</h3>
              <button className="action-button" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="field-group">
                <label>Current Password</label>
                <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData(prev => ({...prev, currentPassword: e.target.value}))} />
              </div>
              <div className="field-group">
                <label>New Password</label>
                <input type="password" required value={securityData.newPassword} onChange={(e) => setSecurityData(prev => ({...prev, newPassword: e.target.value}))} />
              </div>
              <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '16px' }}>Update Password</button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: '440px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3 style={{ color: '#b91c1c' }}>Delete Organization Account</h3>
              <button className="action-button" onClick={() => { setShowDeleteModal(false); setDeletePassword('') }}>✕</button>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 16px', borderRadius: '8px', color: '#991b1b', marginBottom: '18px', fontSize: '0.88rem', lineHeight: 1.5 }}>
              <strong>Warning:</strong> Deleting your sponsor account will permanently close all active sponsorships and remove your organization profile. This action cannot be undone.
            </div>
            <form onSubmit={handleDeleteAccount}>
              <div className="field-group">
                <label>Enter your password to confirm:</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Current account password"
                  value={deletePassword} 
                  onChange={(e) => setDeletePassword(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ flex: 1 }}
                  onClick={() => { setShowDeleteModal(false); setDeletePassword('') }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isDeleting}
                  style={{ flex: 1, background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


