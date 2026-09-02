import { useState } from 'react'

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSeeking, setIsSeeking] = useState(true)

  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '(555) 123-4567',
    school: 'Stanford University',
    major: 'Computer Science',
    year: 'Junior',
    gpa: '3.85',
    bio: 'Passionate about solving real-world problems through technology. Interested in machine learning and startup ecosystems.',
    location: 'San Francisco, CA',
  })

  const [editData, setEditData] = useState(profile)

  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = () => {
    setProfile(editData)
    setIsEditing(false)
    alert('Profile updated successfully!')
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
          <p className="profile-meta">{profile.major} • {profile.year} • {profile.school}</p>
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
                <label>Year of Study</label>
                <select
                  value={editData.year}
                  onChange={(e) => handleEditChange('year', e.target.value)}
                >
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Graduate">Graduate</option>
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
                <span className="label">Year</span>
                <span className="value">{profile.year}</span>
              </div>
              <div className="info-item">
                <span className="label">GPA</span>
                <span className="value">{profile.gpa}</span>
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
            <button type="button" className="settings-item">
              <span>Change Password</span>
              <span className="arrow">→</span>
            </button>
            <button type="button" className="settings-item">
              <span>Two-Factor Authentication</span>
              <span className="arrow">→</span>
            </button>
            <button type="button" className="settings-item danger">
              <span>Delete Account</span>
              <span className="arrow">→</span>
            </button>
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
    </div>
  )
}
