import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminInformationRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await api.get('/admin/information-requests')
        setRequests(data)
      } catch (error) {
        console.error('Failed to fetch information requests:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  return (
    <div className="admin-info-requests" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Information Requests</h2>
          <p className="section-meta" style={{ fontSize: '0.95rem' }}>
            Monitor and track additional information and documents requested from students.
          </p>
        </div>
      </div>
      
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-ink-soft)' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-ink-soft)' }}>
            <h3 style={{ margin: 0, color: 'var(--color-ink-soft)', fontWeight: 500 }}>No pending information requests.</h3>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>Student</th>
                  <th style={{ width: '28%' }}>Sponsorship</th>
                  <th style={{ width: '16%' }}>Requested On</th>
                  <th style={{ width: '28%' }}>Information Requested</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req._id}>
                    <td>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-ink)' }}>{req.student?.name}</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)', marginTop: '2px' }}>{req.student?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{req.sponsorship?.title}</div>
                    </td>
                    <td>{new Date(req.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td style={{ lineHeight: '1.5', color: '#856404' }}>
                      <div style={{ background: '#fff3cd', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ffeeba', fontSize: '0.9rem' }}>
                        {req.reasonForRequesting || 'Additional document required.'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
