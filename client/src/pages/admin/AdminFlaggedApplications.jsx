import { useState } from 'react'

const mockFlaggedApplications = [
  {
    id: 1,
    studentName: 'John Doe',
    institution: 'University of Lagos',
    programme: 'Computer Science',
    level: '400',
    session: '2025/2026',
    sponsorshipTitle: 'Tech Innovators Scholarship',
    reasonForSponsorship: 'I require financial assistance to complete my final year project and pay tuition.',
    submittedInfo: 'All fees have been unpaid since last semester.',
    riskLevel: 'High',
    rulesTriggered: 3,
    dateFlagged: '2026-09-11',
    rules: [
      {
        id: 1,
        severity: 'High',
        name: 'Duplicate Application',
        explanation: 'Student has applied to this same sponsorship under a different account (johndoe2@email.com).'
      },
      {
        id: 2,
        severity: 'Medium',
        name: 'Information Inconsistency',
        explanation: 'Stated level (400) does not match the academic record on file (300).'
      },
      {
        id: 3,
        severity: 'Low',
        name: 'Academic Record Mismatch',
        explanation: 'CGPA stated is 4.5, but last recorded CGPA was 4.2.'
      }
    ]
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    institution: 'Obafemi Awolowo University',
    programme: 'Electrical Engineering',
    level: '200',
    session: '2025/2026',
    sponsorshipTitle: 'Women in STEM Grant',
    reasonForSponsorship: 'To support my accommodation and research materials.',
    submittedInfo: 'Seeking 500,000 NGN for the academic year.',
    riskLevel: 'Medium',
    rulesTriggered: 1,
    dateFlagged: '2026-09-10',
    rules: [
      {
        id: 4,
        severity: 'Medium',
        name: 'Document Forgery Suspicion',
        explanation: 'Identification document appears to be digitally altered (metadata indicates recent Photoshop edit).'
      }
    ]
  }
];

export default function AdminFlaggedApplications() {
  const [selectedApp, setSelectedApp] = useState(null)

  if (selectedApp) {
    return (
      <div className="student-dashboard">
        <button 
          onClick={() => setSelectedApp(null)}
          className="secondary-button"
          style={{ alignSelf: 'flex-start' }}
        >
          &larr; Back to Flagged Applications
        </button>
        
        <section className="dashboard-welcome">
          <div className="section-header">
            <div>
              <h3>Review Flagged Application</h3>
              <p className="section-meta">
                Review fraud detection results and decide on the next steps for {selectedApp.studentName}.
              </p>
            </div>
          </div>
        </section>

        <div className="content-grid">
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card wide">
              <h3>Student Information</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <span className="timeline-label">Full Name</span>
                  <span className="timeline-date">{selectedApp.studentName}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Institution</span>
                  <span className="timeline-date">{selectedApp.institution}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Programme</span>
                  <span className="timeline-date">{selectedApp.programme}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Level & Session</span>
                  <span className="timeline-date">{selectedApp.level} Level, {selectedApp.session}</span>
                </div>
              </div>
            </div>

            <div className="card wide">
              <h3>Application Information</h3>
              <div className="timeline" style={{ flexDirection: 'column', gap: '16px' }}>
                <div className="timeline-item">
                  <span className="timeline-label">Target Sponsorship</span>
                  <span className="timeline-date">{selectedApp.sponsorshipTitle}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Reason for Sponsorship</span>
                  <p style={{ marginTop: '8px', padding: '12px', background: '#f5efe8', borderRadius: '8px' }}>
                    {selectedApp.reasonForSponsorship}
                  </p>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Submitted Information</span>
                  <p style={{ marginTop: '8px', padding: '12px', background: '#f5efe8', borderRadius: '8px' }}>
                    {selectedApp.submittedInfo}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card wide">
              <h3>Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '600' }}>transcript_2025.pdf</span>
                  <button className="secondary-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Preview</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <span style={{ fontWeight: '600' }}>student_id_card.jpg</span>
                  <button className="secondary-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Preview</button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className={`card wide ${selectedApp.riskLevel === 'High' ? 'stat-warning' : 'stat-accent'}`} style={{ border: selectedApp.riskLevel === 'High' ? '2px solid var(--color-danger)' : '2px solid var(--color-warning)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.5rem', color: selectedApp.riskLevel === 'High' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                  {selectedApp.riskLevel.toUpperCase()} RISK
                </h3>
                <p className="card-meta">
                  {selectedApp.rulesTriggered} RULES TRIGGERED
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedApp.rules.map(rule => (
                  <div key={rule.id} style={{ padding: '16px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div className="card-header" style={{ marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{rule.name}</h4>
                      <span className="badge" style={{ background: rule.severity === 'High' ? 'var(--color-danger)' : 'var(--color-warning)', color: 'white' }}>
                        {rule.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>{rule.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card wide">
              <h3>Admin Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <button 
                  className="primary-button"
                  style={{ background: 'var(--color-success)', width: '100%' }}
                  onClick={() => {
                    alert('Application approved and sent to sponsor.')
                    setSelectedApp(null)
                  }}
                >
                  Approve Application
                </button>
                <button 
                  className="primary-button"
                  style={{ background: 'var(--color-danger)', width: '100%' }}
                  onClick={() => {
                    alert('Application rejected.')
                    setSelectedApp(null)
                  }}
                >
                  Reject Application
                </button>
                <div style={{ borderTop: '1px solid var(--color-border)', margin: '8px 0' }}></div>
                <button 
                  className="secondary-button"
                  style={{ width: '100%' }}
                  onClick={() => {
                    const request = prompt('What information do you require from the student?')
                    if(request) {
                      alert('Information request sent to student.')
                      setSelectedApp(null)
                    }
                  }}
                >
                  Request Additional Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header">
          <div>
            <h3>Flagged Applications</h3>
            <p className="section-meta">
              Applications caught by the fraud detection engine requiring manual review.
            </p>
          </div>
        </div>
      </section>

      <section className="active-section">
        <div className="content-grid">
          {mockFlaggedApplications.map((app) => (
            <div key={app.id} className="card wide" style={{ cursor: 'pointer', transition: 'border 0.2s' }} onClick={() => setSelectedApp(app)}>
              <div className="card-header">
                <div>
                  <h4>{app.studentName}</h4>
                  <p className="card-meta">
                    {app.sponsorshipTitle} • {app.institution}
                  </p>
                </div>
                <span className="badge" style={{ background: app.riskLevel === 'High' ? 'var(--color-danger)' : 'var(--color-warning)', color: 'white' }}>
                  {app.riskLevel} Risk
                </span>
              </div>
              
              <div className="timeline" style={{ margin: '12px 0 0', paddingBottom: 0, borderBottom: 'none' }}>
                <div className="timeline-item">
                  <span className="timeline-label">Triggered</span>
                  <span className="timeline-date">{app.rulesTriggered} rules</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Flagged On</span>
                  <span className="timeline-date">{app.dateFlagged}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

