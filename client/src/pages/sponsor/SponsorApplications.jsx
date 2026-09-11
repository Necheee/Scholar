import { useState } from 'react'

const initialApplications = [
  {
    id: 'app-101',
    studentName: 'Chiamaka Okafor',
    email: 'chiamaka.okafor@unilag.edu.ng',
    institution: 'University of Lagos',
    department: 'Electrical & Information Engineering',
    programme: 'Computer Engineering',
    level: '300 Level',
    session: '2025/2026',
    gpa: '3.92',
    sponsorshipId: 'sp-01',
    sponsorshipTitle: 'STEM Excellence Scholarship',
    dateSubmitted: '2026-08-26',
    dateCleared: '2026-09-03',
    status: 'Needs Review', // Needs Review, Approved, Rejected
    motivation:
      'I am currently developing an open-source solar microgrid monitoring controller for rural clinics in southwestern Nigeria. This scholarship will offset my final two years of tuition and laboratory equipment costs, allowing me to focus entirely on research and academic excellence.',
    goals:
      'My aspiration is to lead renewable hardware engineering initiatives across West Africa, bridging energy accessibility through embedded firmware and power systems.',
    documents: [
      { name: 'Official_Transcript_2025_2026.pdf', size: '1.8 MB', type: 'transcript' },
      { name: 'National_Identification_NIN.pdf', size: '640 KB', type: 'id' },
      { name: 'Recommendation_Letter_Prof_Ade.pdf', size: '420 KB', type: 'supporting' },
    ],
    rejectionReason: null,
  },
  {
    id: 'app-102',
    studentName: 'David Adeleke',
    email: 'david.adeleke@covenant.edu.ng',
    institution: 'Covenant University',
    department: 'Computer & Information Sciences',
    programme: 'Electrical Electronics',
    level: '400 Level',
    session: '2025/2026',
    gpa: '3.85',
    sponsorshipId: 'sp-02',
    sponsorshipTitle: 'Future Tech Leaders Grant',
    dateSubmitted: '2026-08-28',
    dateCleared: '2026-09-02',
    status: 'Needs Review',
    motivation:
      'Growing up in a low-income household, financing university tuition has been a continuous strain. Over the past three years, I have maintained top 5% academic standing while building low-cost IoT telemetry sensors for local agricultural farmers.',
    goals:
      'To build a smart hardware startup providing affordable agricultural moisture and soil diagnostic tools across sub-Saharan Africa.',
    documents: [
      { name: 'Transcript_Signed_Registrar.pdf', size: '2.1 MB', type: 'transcript' },
      { name: 'Passport_Data_Page.pdf', size: '890 KB', type: 'id' },
    ],
    rejectionReason: null,
  },
  {
    id: 'app-103',
    studentName: 'Fatima Bello',
    email: 'fatima.bello@abu.edu.ng',
    institution: 'Ahmadu Bello University',
    department: 'Mathematics & Computer Science',
    programme: 'Software Engineering',
    level: '200 Level',
    session: '2025/2026',
    gpa: '3.78',
    sponsorshipId: 'sp-01',
    sponsorshipTitle: 'STEM Excellence Scholarship',
    dateSubmitted: '2026-08-25',
    dateCleared: '2026-09-01',
    status: 'Needs Review',
    motivation:
      'As a female software engineering student in Northern Nigeria, I mentor over 40 young girls through our university tech guild. Receiving this scholarship will enable me to purchase a high-performance workstation and cover boarding expenses.',
    goals:
      'To earn a first-class degree and specialize in applied cryptographic protocols and distributed computing architectures.',
    documents: [
      { name: 'ABU_Transcript_Year1_2.pdf', size: '1.4 MB', type: 'transcript' },
      { name: 'National_ID_Card.png', size: '1.1 MB', type: 'id' },
      { name: 'GirlsInTech_Community_Letter.pdf', size: '310 KB', type: 'supporting' },
    ],
    rejectionReason: null,
  },
  {
    id: 'app-098',
    studentName: 'Emmanuel Nwachukwu',
    email: 'emmanuel.n@unn.edu.ng',
    institution: 'University of Nigeria, Nsukka',
    department: 'Mechanical Engineering',
    programme: 'Mechanical Engineering',
    level: '500 Level',
    session: '2024/2025',
    gpa: '3.91',
    sponsorshipId: 'sp-04',
    sponsorshipTitle: '2025/2026 Merit Bursary',
    dateSubmitted: '2026-07-15',
    dateCleared: '2026-07-20',
    status: 'Approved',
    motivation: 'Final year capstone support for hydraulic biomimetic prosthetics.',
    goals: 'Biomedical engineering research and development.',
    documents: [{ name: 'UNN_Final_Transcript.pdf', size: '2.4 MB', type: 'transcript' }],
    rejectionReason: null,
  },
]

export default function SponsorApplications() {
  const [applications, setApplications] = useState(initialApplications)
  const [filterStatus, setFilterStatus] = useState('All')
  const [activeApp, setActiveApp] = useState(null)
  const [rejectModalApp, setRejectModalApp] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  function handleApprove(appId) {
    if (!window.confirm('Are you sure you want to approve and award this sponsorship?')) return

    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? { ...app, status: 'Approved', rejectionReason: null }
          : app
      )
    )

    if (activeApp && activeApp.id === appId) {
      setActiveApp((prev) => ({ ...prev, status: 'Approved' }))
    }

    alert('Application approved successfully! The student has been notified.')
  }

  function handleConfirmReject(e) {
    e.preventDefault()
    if (!rejectionReason.trim()) {
      alert('A rejection reason is mandatory to help guide the student.')
      return
    }

    setApplications((prev) =>
      prev.map((app) =>
        app.id === rejectModalApp.id
          ? { ...app, status: 'Rejected', rejectionReason }
          : app
      )
    )

    if (activeApp && activeApp.id === rejectModalApp.id) {
      setActiveApp((prev) => ({ ...prev, status: 'Rejected', rejectionReason }))
    }

    setRejectModalApp(null)
    setRejectionReason('')
    alert('Application rejected. Feedback has been recorded and communicated to the student.')
  }

  const filtered = applications.filter((app) => {
    if (filterStatus === 'Needs Review') return app.status === 'Needs Review'
    if (filterStatus === 'Approved') return app.status === 'Approved'
    if (filterStatus === 'Rejected') return app.status === 'Rejected'
    return true
  })

  return (
    <div className="sponsorships-browser">
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>Candidate Applications for Review</h2>
          <p className="section-meta">
            All applications displayed here have passed administrative security checks and are ready for funding evaluation.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <section className="filters-section" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-ink)' }}>
            Status:
          </span>
          {['All', 'Needs Review', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={filterStatus === tab ? 'primary-button' : 'secondary-button'}
              style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              onClick={() => setFilterStatus(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Applications List */}
      <section className="results-section">
        <div className="sponsorships-list">
          {filtered.map((app) => (
            <div key={app.id} className="sponsorship-card card">
              <div className="sponsorship-header">
                <div>
                  <h4>{app.studentName}</h4>
                  <p className="card-meta">
                    {app.programme} • {app.institution}
                  </p>
                </div>
                <div className="sponsorship-meta">
                  <span
                    className={`badge ${
                      app.status === 'Approved'
                        ? 'badge-success'
                        : app.status === 'Rejected'
                        ? 'secondary-button danger'
                        : 'badge-warning'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              </div>

              <div className="sponsorship-details">
                <div className="detail-item">
                  <span className="detail-label">Opportunity</span>
                  <span className="detail-value">{app.sponsorshipTitle}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Level & Session</span>
                  <span className="detail-value">
                    {app.level} ({app.session})
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Academic GPA</span>
                  <span className="detail-value">{app.gpa}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Screened & Cleared</span>
                  <span className="detail-value">{app.dateCleared}</span>
                </div>
              </div>

              {app.rejectionReason && (
                <div
                  style={{
                    backgroundColor: 'rgba(175, 74, 60, 0.08)',
                    borderLeft: '3px solid var(--color-danger)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    margin: '12px 0',
                    fontSize: '0.88rem',
                  }}
                >
                  <strong>Rejection Feedback:</strong> {app.rejectionReason}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setActiveApp(app)}
                >
                  Review Full Application
                </button>

                {app.status === 'Needs Review' && (
                  <>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ backgroundColor: 'var(--color-success)' }}
                      onClick={() => handleApprove(app.id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      type="button"
                      className="secondary-button danger"
                      onClick={() => setRejectModalApp(app)}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal: Full Application Review */}
      {activeApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 23, 19, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '780px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3>Review Application: {activeApp.studentName}</h3>
                <p className="section-meta">
                  Target Fund: <strong>{activeApp.sponsorshipTitle}</strong>
                </p>
              </div>
              <button
                type="button"
                className="action-button"
                onClick={() => setActiveApp(null)}
              >
                ✕
              </button>
            </div>

            {/* Screening Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: 'rgba(61, 107, 77, 0.08)',
                border: '1px solid rgba(61, 107, 77, 0.25)',
                borderRadius: '12px',
                color: 'var(--color-success)',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              <span>🛡️ Security Verification:</span>
              <span>This application successfully passed all pre-screening fraud checks and is cleared for evaluation.</span>
            </div>

            {/* Academic Information */}
            <div className="review-section" style={{ marginBottom: '18px' }}>
              <h4>Student & Academic Profile</h4>
              <dl className="review-fields" style={{ marginTop: '8px' }}>
                <dt>Institution:</dt>
                <dd>{activeApp.institution}</dd>
                <dt>Department:</dt>
                <dd>{activeApp.department}</dd>
                <dt>Programme / Major:</dt>
                <dd>{activeApp.programme}</dd>
                <dt>Level & Session:</dt>
                <dd>{activeApp.level} ({activeApp.session})</dd>
                <dt>Cumulative GPA:</dt>
                <dd>{activeApp.gpa} / 4.00</dd>
                <dt>Applicant Email:</dt>
                <dd>{activeApp.email}</dd>
              </dl>
            </div>

            {/* Motivation Statement */}
            <div className="review-section" style={{ marginBottom: '18px' }}>
              <h4>Statement / Reason for Requesting Sponsorship</h4>
              <p className="review-text" style={{ marginTop: '6px' }}>
                {activeApp.motivation}
              </p>
            </div>

            {/* Career Goals */}
            <div className="review-section" style={{ marginBottom: '18px' }}>
              <h4>Academic & Career Goals</h4>
              <p className="review-text" style={{ marginTop: '6px' }}>
                {activeApp.goals}
              </p>
            </div>

            {/* Attached Documents */}
            <div className="review-section" style={{ marginBottom: '24px' }}>
              <h4>Attached Documents ({activeApp.documents.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {activeApp.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: '#fffaf7',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📄 {doc.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginLeft: '10px' }}>
                        {doc.size}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                      onClick={() => setPreviewDoc(doc)}
                    >
                      Preview Document
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--color-border)',
                paddingTop: '18px',
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={() => setActiveApp(null)}
              >
                Close Window
              </button>

              {activeApp.status === 'Needs Review' ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="secondary-button danger"
                    onClick={() => {
                      setRejectModalApp(activeApp)
                    }}
                  >
                    ✕ Reject Candidate
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ backgroundColor: 'var(--color-success)' }}
                    onClick={() => handleApprove(activeApp.id)}
                  >
                    ✓ Award Sponsorship
                  </button>
                </div>
              ) : (
                <span className="badge badge-info">
                  Current Decision: {activeApp.status}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Document Preview Simulation */}
      {previewDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1100,
            padding: '24px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '560px',
              width: '100%',
              textAlign: 'center',
              backgroundColor: '#fff',
            }}
          >
            <div className="section-header">
              <h4>Document Preview</h4>
              <button
                type="button"
                className="action-button"
                onClick={() => setPreviewDoc(null)}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                height: '240px',
                display: 'grid',
                placeItems: 'center',
                background: '#f9f5f0',
                borderRadius: '12px',
                border: '1px dashed var(--color-border)',
                margin: '18px 0',
              }}
            >
              <div>
                <p style={{ fontSize: '3rem', margin: 0 }}>📄</p>
                <p style={{ fontWeight: 600, marginTop: '8px' }}>{previewDoc.name}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                  {previewDoc.size} • Verified secure document
                </p>
              </div>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={() => setPreviewDoc(null)}
            >
              Done Previewing
            </button>
          </div>
        </div>
      )}

      {/* Modal: Mandatory Rejection Reason */}
      {rejectModalApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 23, 19, 0.65)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1200,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '14px' }}>
              <h3>Decline Application</h3>
              <button
                type="button"
                className="action-button"
                onClick={() => setRejectModalApp(null)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-soft)', marginBottom: '14px' }}>
              Provide constructive feedback for <strong>{rejectModalApp.studentName}</strong>. As specified in system rules, a clear rejection reason is mandatory.
            </p>

            <form onSubmit={handleConfirmReject} className="auth-form">
              <div className="field-group">
                <label>Reason for Rejection *</label>
                <textarea
                  rows="4"
                  placeholder="e.g. Funding priority given to 400L final year students this cycle; encourage re-applying next session..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setRejectModalApp(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="secondary-button danger">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

