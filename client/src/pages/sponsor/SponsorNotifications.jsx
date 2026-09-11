import { useState } from 'react'

export default function SponsorNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'new_cleared_application',
      title: 'New Cleared Application Ready for Review',
      message: 'Chiamaka Okafor has submitted an application for "STEM Excellence Scholarship" and passed security screening.',
      timestamp: '2026-09-03T10:15:00',
      read: false,
      icon: '🛡️',
    },
    {
      id: 2,
      type: 'new_cleared_application',
      title: 'New Cleared Application Ready for Review',
      message: 'David Adeleke has submitted an application for "Future Tech Leaders Grant" and passed security screening.',
      timestamp: '2026-09-02T14:30:00',
      read: false,
      icon: '🛡️',
    },
    {
      id: 3,
      type: 'opportunity_locked',
      title: 'Sponsorship Opportunity Locked for Editing',
      message: 'Your opportunity "Future Tech Leaders Grant" received its first submission and is now locked for editing (Rule DEC-008).',
      timestamp: '2026-08-28T09:00:00',
      read: true,
      icon: '🔒',
    },
    {
      id: 4,
      type: 'deadline_alert',
      title: 'Upcoming Application Deadline',
      message: 'The deadline for "STEM Excellence Scholarship" is approaching in 40 days (2026-10-15).',
      timestamp: '2026-08-20T11:00:00',
      read: true,
      icon: '⏰',
    },
  ])

  function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function deleteNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function clearAllRead() {
    setNotifications((prev) => prev.filter((n) => !n.read))
  }

  function formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const readCount = notifications.filter((n) => n.read).length

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h2>Sponsor Notifications</h2>
          {unreadCount > 0 && <p className="unread-badge">{unreadCount} unread alert(s)</p>}
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
          {readCount > 0 && (
            <button
              type="button"
              className="secondary-button danger"
              onClick={clearAllRead}
            >
              Clear read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🔔</p>
          <h4>No notifications</h4>
          <p>You have reviewed all current sponsor updates.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.read ? 'read' : 'unread'}`}
            >
              <div className="notif-icon">{notif.icon}</div>

              <div
                className="notif-content"
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <h4 className="notif-title">{notif.title}</h4>
                <p className="notif-message">{notif.message}</p>
                <p className="notif-time">{formatDate(notif.timestamp)}</p>
              </div>

              <div className="notif-actions">
                {!notif.read && (
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => markAsRead(notif.id)}
                    title="Mark as read"
                  >
                    •
                  </button>
                )}
                <button
                  type="button"
                  className="action-button"
                  onClick={() => deleteNotification(notif.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

