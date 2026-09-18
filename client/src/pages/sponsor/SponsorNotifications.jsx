import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function SponsorNotifications() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      )
    } catch (error) {
      console.error('Failed to mark read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    for (const notification of unread) {
      await handleMarkAsRead(notification._id)
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'Unread') return !notif.isRead
    return true
  })

  if (isLoading) return <div>Loading notifications...</div>

  return (
    <div className="notifications-page">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Notifications</h2>
          <p className="section-meta">Stay updated on your applications and account activity.</p>
        </div>
        <button className="secondary-button" onClick={markAllAsRead}>
          Mark all as read
        </button>
      </div>

      <div className="filters-row" style={{ marginBottom: '24px' }}>
        <button
          className={filter === 'All' ? 'active-filter' : 'inactive-filter'}
          onClick={() => setFilter('All')}
        >
          All
        </button>
        <button
          className={filter === 'Unread' ? 'active-filter' : 'inactive-filter'}
          onClick={() => setFilter('Unread')}
        >
          Unread
        </button>
      </div>

      <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredNotifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-ink-soft)' }}>
            <p>You have no {filter.toLowerCase()} notifications.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`card ${notif.isRead ? '' : 'unread-notification'}`}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '20px',
                borderLeft: notif.isRead ? 'none' : '4px solid var(--color-primary)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>{notif.title}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--color-ink-soft)' }}>{notif.message}</p>
              </div>
              
              {!notif.isRead && (
                <button
                  className="action-button"
                  style={{ alignSelf: 'center', background: 'var(--color-paper-border)', padding: '6px 12px', fontSize: '0.85rem' }}
                  onClick={() => handleMarkAsRead(notif._id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
