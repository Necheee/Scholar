import { useState } from 'react'

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'application_update',
      title: 'Application Status Update',
      message: 'Your application for "Full Tuition + Living Expenses" is under review.',
      timestamp: '2026-09-01T14:30:00',
      read: false,
      icon: '📋',
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'New Sponsorship Opportunity',
      message: 'TechForward Foundation posted a new STEM scholarship matching your profile.',
      timestamp: '2026-08-31T10:15:00',
      read: false,
      icon: '🎯',
    },
    {
      id: 3,
      type: 'message',
      title: 'Message from Sponsor',
      message: 'Merit Foundation sent you a message about your application.',
      timestamp: '2026-08-30T16:45:00',
      read: false,
      icon: '💬',
    },
    {
      id: 4,
      type: 'reminder',
      title: 'Application Deadline Reminder',
      message: 'Your application for "Global Leaders Initiative" is due in 5 days.',
      timestamp: '2026-08-29T09:00:00',
      read: true,
      icon: '⏰',
    },
    {
      id: 5,
      type: 'success',
      title: 'Application Accepted',
      message: 'Congratulations! Your application for "Global Leaders Initiative" has been accepted.',
      timestamp: '2026-08-10T11:20:00',
      read: true,
      icon: '✓',
    },
  ])

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== id)
    )
  }

  const clearAllRead = () => {
    setNotifications(prev =>
      prev.filter(notif => !notif.read)
    )
  }

  const formatDate = (dateString) => {
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

  const unreadCount = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <p className="unread-badge">{unreadCount} unread</p>
          )}
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
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notif => (
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
