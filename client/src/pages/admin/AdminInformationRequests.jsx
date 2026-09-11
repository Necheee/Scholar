export default function AdminInformationRequests() {
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
        <div className="card wide" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ margin: 0, color: 'var(--color-ink-soft)' }}>No pending information requests.</h3>
        </div>
      </section>
    </div>
  )
}

