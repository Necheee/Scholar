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
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Information Requests</h3>
            <p className="section-meta">
              Track additional information requested from students.
            </p>
          </div>
        </div>
      </section>
      
      <section className="active-section">
        <div className="card wide">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading requests...</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>No pending information requests.</h3>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Sponsorship</th>
                    <th>Requested On</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req._id}>
                      <td>
                        <strong>{req.student.name}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>{req.student.email}</div>
                      </td>
                      <td>{req.sponsorship.title}</td>
                      <td>{new Date(req.updatedAt).toLocaleDateString()}</td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                        {req.reasonForRequesting}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
