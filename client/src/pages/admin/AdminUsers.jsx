import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (selectedRole) params.role = selectedRole
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const { data } = await api.get('/admin/users', { params })
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      alert(error.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [selectedRole])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleDeleteUser = async (targetUser) => {
    if (targetUser._id === currentUser?._id) {
      alert('You cannot delete your own logged-in administrator account.')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`
    )
    if (!confirmed) return

    try {
      setDeletingId(targetUser._id)
      const { data } = await api.delete(`/admin/users/${targetUser._id}`)
      setFeedbackMsg(data.message || 'User removed successfully')
      setUsers((prev) => prev.filter((u) => u._id !== targetUser._id))
      setTimeout(() => setFeedbackMsg(''), 4000)
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert(error.response?.data?.message || 'Failed to delete user account')
    } finally {
      setDeletingId(null)
    }
  }

  const studentCount = users.filter((u) => u.role === 'Student').length
  const sponsorCount = users.filter((u) => u.role === 'Sponsor').length
  const adminCount = users.filter((u) => u.role === 'Admin').length

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin':
        return { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }
      case 'Sponsor':
        return { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
      case 'Student':
      default:
        return { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
    }
  }

  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div>
            <h3>User Management</h3>
            <p className="section-meta">
              Oversee platform accounts, inspect credentials, and manage multi-role system access (Chapter 3.2.2.1 Use Case & Class Diagram).
            </p>
          </div>
        </div>
      </section>

      {feedbackMsg && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '20px',
          backgroundColor: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          ✓ {feedbackMsg}
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Displayed Accounts</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #2563eb' }}>
          <div className="stat-value">{studentCount}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #16a34a' }}>
          <div className="stat-value">{sponsorCount}</div>
          <div className="stat-label">Sponsors</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #dc2626' }}>
          <div className="stat-value">{adminCount}</div>
          <div className="stat-label">Administrators</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card wide" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Role Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={selectedRole === '' ? 'primary-button' : 'secondary-button'}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              onClick={() => setSelectedRole('')}
            >
              All Roles
            </button>
            <button
              type="button"
              className={selectedRole === 'Student' ? 'primary-button' : 'secondary-button'}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              onClick={() => setSelectedRole('Student')}
            >
              Students Only
            </button>
            <button
              type="button"
              className={selectedRole === 'Sponsor' ? 'primary-button' : 'secondary-button'}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              onClick={() => setSelectedRole('Sponsor')}
            >
              Sponsors Only
            </button>
            <button
              type="button"
              className={selectedRole === 'Admin' ? 'primary-button' : 'secondary-button'}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              onClick={() => setSelectedRole('Admin')}
            >
              Admins Only
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-paper-border)',
                minWidth: '220px',
                fontSize: '0.9rem'
              }}
            />
            <button type="submit" className="primary-button" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                className="secondary-button"
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                onClick={() => { setSearchTerm(''); fetchUsers(); }}
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Users Table */}
      <section className="active-section">
        <div className="card wide">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading registered users...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>No users found matching query.</h3>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Registered Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?._id
                    return (
                      <tr key={u._id}>
                        <td>
                          <strong>{u.name}</strong>
                          {isSelf && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#e0f2fe',
                              color: '#0369a1'
                            }}>
                              You
                            </span>
                          )}
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                            {u.email}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            ...getRoleBadgeStyle(u.role)
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.9rem' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>
                            {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '500' }}>
                            ● Active
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="danger-button"
                            style={{
                              padding: '5px 12px',
                              fontSize: '0.8rem',
                              opacity: isSelf ? 0.4 : 1,
                              cursor: isSelf ? 'not-allowed' : 'pointer'
                            }}
                            disabled={isSelf || deletingId === u._id}
                            onClick={() => handleDeleteUser(u)}
                            title={isSelf ? 'Cannot delete your own active account' : 'Permanently remove this user'}
                          >
                            {deletingId === u._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

