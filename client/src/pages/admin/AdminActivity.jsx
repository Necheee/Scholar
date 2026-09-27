import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminActivity() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/activity')
        setLogs(data)
      } catch (error) {
        console.error('Failed to fetch activity logs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Recent Activity</h3>
            <p className="section-meta">
              System-wide activity logs.
            </p>
          </div>
        </div>
      </section>
      
      <section className="active-section">
        <div className="card wide">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading activity...</div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>No recent activity to display.</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {logs.map(log => (
                <div key={log._id} style={{ display: 'flex', gap: '16px', padding: '16px', borderBottom: '1px solid var(--color-paper-border)' }}>
                  <div style={{ minWidth: '100px', fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>{log.action}</strong>
                    <div style={{ fontSize: '0.9rem' }}>{log.description}</div>
                    {log.user && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '4px' }}>
                        By: {log.user.name} ({log.role})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
