import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

const LEVEL_LABELS = {
  '100-level': '100 Level',
  '200-level': '200 Level',
  '300-level': '300 Level',
  '400-level': '400 Level',
  '500-level': '500 Level',
  '600-level': '600 Level',
}

const formatLevel = (val) => LEVEL_LABELS[val] || val

export default function StudentProfile() {
  const { user, logout } = useAuth()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [isSeeking, setIsSeeking] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const getInitialProfile = () => {
    const isDavid = user?.name?.toLowerCase().includes('david') || user?.email?.toLowerCase().includes('david')
    if (isDavid) {
      return {
        name: user?.name || 'David Adeleke',
        email: user?.email || 'david.adeleke@scholar.edu',
        phone: '(555) 345-6789',
        school: 'Covenant University',
        major: 'Electrical Electronics',
        year: '400-level',
        gpa: '3.85',
        bio: 'Hardware researcher specializing in low-power LoRaWAN networks for precision agriculture.',
        location: 'Ogun State, Nigeria',
        bankName: 'Access Bank',
        accountNumber: '0123456789',
        accountName: user?.name || 'David Adeleke',
      }
    }
    return {
      name: user?.name || 'Alex Johnson',
      email: user?.email || 'alex@example.com',
      phone: '(555) 123-4567',
      school: 'University of Ibadan',
      major: 'Computer Science',
      year: '300-level',
      gpa: '3.85',
      bio: 'Passionate about distributed systems and cloud infrastructure. Ranked in the top 3% of the department.',
        location: 'Enugu State, Nigeria',
        bankName: 'Guaranty Trust Bank (GTBank)',
        accountNumber: '0234567891',
        accountName: user?.name || 'Alex Johnson',
    }
  }

  const [profile, setProfile] = useState(getInitialProfile)
  const [editData, setEditData] = useState(getInitialProfile)

  useEffect(() => {
    const updated = getInitialProfile()
    setProfile(updated)
    setEditData(updated)
    async function fetchBackendProfile() {
      try {
        const { data } = await api.get('/auth/student-profile')
        if (data) {
          setProfile(prev => ({
            ...prev,
            school: data.institution || prev.school,
            major: data.department || prev.major,
            bankName: data.bankDetails?.bankName || prev.bankName,
            accountNumber: data.bankDetails?.accountNumber || prev.accountNumber,
            accountName: data.bankDetails?.accountName || prev.accountName,
          }))
          setEditData(prev => ({
            ...prev,
            school: data.institution || prev.school,
            major: data.department || prev.major,
            bankName: data.bankDetails?.bankName || prev.bankName,
            accountNumber: data.bankDetails?.accountNumber || prev.accountNumber,
            accountName: data.bankDetails?.accountName || prev.accountName,
          }))
          if (data.seekingSponsorship !== undefined) {
            setIsSeeking(data.seekingSponsorship)
          }
        }
      } catch (err) {
        console.warn('Backend student profile fetch fallback:', err)
      }
    }

    fetchBackendProfile()
  }, [user])

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true)
      await api.put('/auth/student-profile', {
        institution: editData.school,
        department: editData.major,
        seekingSponsorship: isSeeking,
        bankDetails: {
          bankName: editData.bankName,
          accountNumber: editData.accountNumber,
          accountName: editData.accountName,
        }
      })
  
      setProfile(editData)
  
      setIsEditing(false)
      alert('Profile and disbursement bank details updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
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
    try {
      await api.delete('/auth/delete-account', { data: { password: securityData.currentPassword } })
      alert('Account deleted successfully.')
      logout()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete account')
    }
  }

  const handleCancelEdit = () => {
    setEditData(profile)
    setIsEditing(false)

  }

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {profile.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <div className="profile-title">
          <h2>{profile.name}</h2>
          <p className="profile-meta">{profile.major} • {formatLevel(profile.year)} • {profile.school}</p>
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
        {/* Contact Information */}
        <section className="profile-section card">
          <h3>Contact Information</h3>

          {isEditing ? (
            <div className="form-grid">
              <div className="field-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  disabled
                />
              </div>
              <div className="field-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => handleEditChange('phone', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Location</label>
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
                <span className="label">Email</span>
                <span className="value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Phone</span>
                <span className="value">{profile.phone}</span>
              </div>
              <div className="info-item">
                <span className="label">Location</span>
                <span className="value">{profile.location}</span>
              </div>
            </div>
          )}
        </section>

        {/* Academic Information */}
        <section className="profile-section card">
          <h3>Academic Information</h3>

          {isEditing ? (
            <div className="form-grid">
              <div className="field-group">
                <label>School / University</label>
                <input
                  type="text"
                  value={editData.school}
                  onChange={(e) => handleEditChange('school', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Major</label>
                <input
                  type="text"
                  value={editData.major}
                  onChange={(e) => handleEditChange('major', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Year / Level of Study</label>
                <select
                  value={editData.year}
                  onChange={(e) => handleEditChange('year', e.target.value)}
                >
                  <option value="100-level">100 Level</option>
                  <option value="200-level">200 Level</option>
                  <option value="300-level">300 Level</option>
                  <option value="400-level">400 Level</option>
                  <option value="500-level">500 Level</option>
                  <option value="600-level">600 Level</option>
                </select>
              </div>
              <div className="field-group">
                <label>GPA</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={editData.gpa}
                  onChange={(e) => handleEditChange('gpa', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <span className="label">School</span>
                <span className="value">{profile.school}</span>
              </div>
              <div className="info-item">
                <span className="label">Major</span>
                <span className="value">{profile.major}</span>
              </div>
              <div className="info-item">
                <span className="label">Level</span>
                <span className="value">{formatLevel(profile.year)}</span>
              </div>
              <div className="info-item">
                <span className="label">GPA</span>
                <span className="value">{profile.gpa}</span>
              </div>
            </div>
          )}
        </section>

        {/* Settlement Bank Details (NUBAN) */}
        <section className="profile-section card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>Disbursement Bank Account (NUBAN)</h3>
            <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
              ✓ Verified Payout Account
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', marginBottom: '16px' }}>
            Your official Nigerian commercial bank account where scholarship tuition grants and academic stipends are settled.
          </p>

          {isEditing ? (
            <div className="form-grid">
              <div className="field-group">
                <label>Bank Name</label>
                <select
                  value={editData.bankName}
                  onChange={(e) => handleEditChange('bankName', e.target.value)}
                >
                  <option value="">Select Bank...</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="GTBank">Guaranty Trust Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                  <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                  <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
                  <option value="Kuda Bank">Kuda Bank</option>
                  <option value="OPay">OPay Digital Services</option>
                  <option value="PalmPay">PalmPay</option>
                  <option value="Moniepoint MFB">Moniepoint MFB</option>
                  <option value="Fidelity Bank">Fidelity Bank</option>
                  <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                  <option value="Union Bank">Union Bank</option>
                  <option value="Wema Bank (ALAT)">Wema Bank (ALAT)</option>
                  <option value="Sterling Bank">Sterling Bank</option>
                </select>
              </div>
              <div className="field-group">
                <label>NUBAN Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. 0123456789"
                  value={editData.accountNumber}
                  onChange={(e) => handleEditChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label>Account Holder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={editData.accountName}
                  onChange={(e) => handleEditChange('accountName', e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Bank Name</span>
                <span className="value">{profile.bankName || 'Not Set (Click Edit Profile)'}</span>
              </div>
              <div className="info-item">
                <span className="label">Account Number</span>
                <strong className="value" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {profile.accountNumber || '••••••••••'}
                </strong>
              </div>
              <div className="info-item">
                <span className="label">Account Name</span>
                <span className="value">{profile.accountName || profile.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Disbursement Channel</span>
                <span className="value" style={{ color: '#166534', fontWeight: 600 }}>Active for Payouts</span>
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <section className="profile-section card">
          <h3>About</h3>

          {isEditing ? (
            <div className="field-group">
              <label>Bio</label>
              <textarea
                rows="4"
                value={editData.bio}
                onChange={(e) => handleEditChange('bio', e.target.value)}
                placeholder="Tell sponsors about yourself..."
              />
            </div>
          ) : (
            <p className="bio-text">{profile.bio}</p>
          )}
        </section>

        {/* Seeking Sponsorship Toggle */}
        <section className="profile-section card">
          <h3>Seeking Sponsorship</h3>
          <div className="seeking-toggle">
            <p className="toggle-description">
              When enabled, sponsors can discover you in their student directory and may reach out with opportunities.
            </p>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={isSeeking}
                onChange={(e) => setIsSeeking(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <p className="toggle-status">
              {isSeeking ? '✓ You are visible to sponsors' : '✗ You are not visible to sponsors'}
            </p>
          </div>
        </section>

        {/* Account Settings */}
        <section className="profile-section card">
          <h3>Account & Security</h3>
          <div className="settings-list">
            <button type="button" className="settings-item" onClick={() => setShowPasswordModal(true)}><span>Change Password</span><span className="arrow">&#8594;</span></button>
            <button type="button" className="settings-item" onClick={() => alert('This feature is currently in development and will be available soon!')}>
              <span>Two-Factor Authentication</span>
              <span className="arrow">→</span>
            </button>
            <button type="button" className="settings-item danger" onClick={() => setShowDeleteModal(true)}><span>Delete Account</span><span className="arrow">&#8594;</span></button>
          </div>
        </section>
      </div>

      {/* Edit Action Buttons */}
      {isEditing && (
        <div className="edit-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleCancelEdit}
          >
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Change Password</h3>
              <button className="action-button" onClick={() => setShowPasswordModal(false)}>X</button>
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
          <div className="card modal-content" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h3>Delete Account</h3>
              <button className="action-button" onClick={() => setShowDeleteModal(false)}>X</button>
            </div>
            <div style={{ color: '#d32f2f', marginBottom: '16px' }}>
              <strong>Warning:</strong> This action is permanent and cannot be undone.
            </div>
            <form onSubmit={handleDeleteAccount}>
              <div className="field-group">
                <label>Enter password to confirm</label>
                <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData(prev => ({...prev, currentPassword: e.target.value}))} />
              </div>
              <button type="submit" className="primary-button" style={{ width: '100%', marginTop: '16px', background: '#d32f2f', color: 'white' }}>Delete Account</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

