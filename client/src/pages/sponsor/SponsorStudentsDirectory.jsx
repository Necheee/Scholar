import { useState, useEffect } from 'react'
import api from '../../services/api.js'
import RequestDocumentsModal from '../../components/RequestDocumentsModal.jsx'

const fallbackStudents = [
  {
    id: 'stud-01',
    name: 'Alex Johnson',
    email: 'alex.johnson@scholar.edu',
    institution: 'University of Ibadan',
    programme: 'Computer Science',
    department: 'Computer Science',
    level: '300 Level',
    session: '2025/2026',
    gpa: '3.85',
    seekingSponsorship: true,
    bio: 'Passionate about distributed systems and cloud infrastructure. Ranked in the top 3% of the department with an active record of peer tutoring in data structures.',
    careerGoal: 'Cloud Platform Engineer & Tech Educator in West Africa',
    skills: ['Python', 'Golang', 'Docker', 'Algorithm Design'],
  },
  {
    id: 'stud-02',
    name: 'Chiamaka Okafor',
    email: 'chiamaka.okafor@scholar.edu',
    institution: 'University of Lagos',
    programme: 'Computer Engineering',
    department: 'Electrical & Information Engineering',
    level: '300 Level',
    session: '2025/2026',
    gpa: '3.92',
    seekingSponsorship: true,
    bio: 'Embedded systems engineer developing solar telemetric monitors for community health centers in underserved zones.',
    careerGoal: 'Renewable IoT Infrastructure Engineer',
    skills: ['Embedded C', 'Hardware Prototyping', 'Circuit Design'],
  },
  {
    id: 'stud-03',
    name: 'David Adeleke',
    email: 'david.adeleke@scholar.edu',
    institution: 'Covenant University',
    programme: 'Electrical Electronics',
    department: 'Electrical Engineering',
    level: '400 Level',
    session: '2025/2026',
    gpa: '3.85',
    seekingSponsorship: true,
    bio: 'Hardware researcher specializing in low-power LoRaWAN networks for precision agriculture.',
    careerGoal: 'Agritech Hardware Specialist',
    skills: ['C++', 'Sensor Networks', 'PCB Layout'],
  },
  {
    id: 'stud-04',
    name: 'Fatima Bello',
    email: 'fatima.bello@scholar.edu',
    institution: 'Ahmadu Bello University',
    programme: 'Software Engineering',
    department: 'Computer Science',
    level: '200 Level',
    session: '2025/2026',
    gpa: '3.78',
    seekingSponsorship: true,
    bio: 'Tech community builder and aspiring security architect. Active in open source cryptography and women in tech mentoring.',
    careerGoal: 'Cryptographic Protocol Engineer',
    skills: ['Rust', 'Java', 'Cryptography'],
  },
  {
    id: 'stud-05',
    name: 'Kelechi Amadi',
    email: 'kelechi.amadi@scholar.edu',
    institution: 'Federal University of Technology, Owerri',
    programme: 'Mechanical Engineering',
    department: 'Mechanical Engineering',
    level: '400 Level',
    session: '2025/2026',
    gpa: '3.65',
    seekingSponsorship: true,
    bio: 'Passionate about computational fluid dynamics and affordable prosthetic mechanical linkages.',
    careerGoal: 'Biomechanical Product Designer',
    skills: ['SolidWorks', 'MATLAB', 'Finite Element Analysis'],
  },
]

export default function SponsorStudentsDirectory() {
  const [students, setStudents] = useState(fallbackStudents)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstitution, setSelectedInstitution] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [requestDocStudent, setRequestDocStudent] = useState(null)
  const [successToast, setSuccessToast] = useState('')

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/document-requests/seeking-students')
      if (data && data.length > 0) {
        setStudents(data)
      }
    } catch (err) {
      console.warn('Backend seeking-students fetch fallback:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const institutions = ['All', ...new Set(students.map((s) => s.institution))]

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.programme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.institution.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesInst =
      selectedInstitution === 'All' || s.institution === selectedInstitution
    return matchesSearch && matchesInst
  })

  const handleRequestSuccess = () => {
    setSuccessToast('Document request has been sent successfully to the student!')
    setTimeout(() => setSuccessToast(''), 6000)
    fetchStudents()
  }

  return (
    <div className="sponsorships-browser">
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '0.92rem',
          }}
        >
          <span>✓</span> {successToast}
        </div>
      )}

      {/* Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>Students Seeking Sponsorship</h2>
          <p className="section-meta">
            Discover verified students seeking scholarships and reach out directly for required verification documents.
          </p>
        </div>
      </div>

      {/* Student Privacy Notice Banner */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: '#fffaf7',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          fontSize: '0.88rem',
          color: 'var(--color-ink-soft)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🔒</span>
        <div>
          <strong>Student Privacy Guard:</strong> This directory displays academic highlights. As a registered sponsor, you can click <strong>"Request More"</strong> on any student to directly request official transcripts, student ID, and verification records.
        </div>
      </div>

      {/* Search & Filters */}
      <section className="filters-section" style={{ padding: '20px' }}>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Student or Programme</label>
            <input
              type="text"
              placeholder="e.g. Computer Science, Alex, Covenant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Institution</label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="filter-select"
            >
              {institutions.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Student Cards Grid */}
      <section className="results-section">
        {isLoading && students.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-ink-soft)' }}>
            Loading students directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-ink-soft)' }}>
            <p style={{ margin: 0, fontSize: '1rem' }}>No students found matching your search criteria.</p>
          </div>
        ) : (
          <div className="content-grid">
            {filtered.map((student) => {
              const req = student.documentRequest
              const hasSubmitted = req && req.status === 'Submitted'
              const isPending = req && req.status === 'Pending'

              return (
                <div
                  key={student.id || student.userId}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                  <div>
                    <div className="card-header" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>{student.name}</h4>
                        <p className="card-meta" style={{ margin: 0 }}>
                          {student.programme} • {student.institution}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                        <span className="badge badge-success">✓ Seeking Sponsorship</span>
                        {hasSubmitted && (
                          <span
                            className="badge"
                            style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                          >
                            ✓ Docs Received ({req.submittedDocuments?.length || 0})
                          </span>
                        )}
                        {isPending && (
                          <span
                            className="badge"
                            style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}
                          >
                            ⏳ Docs Requested
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="timeline" style={{ margin: '14px 0' }}>
                      <div className="timeline-item">
                        <span className="timeline-label">Academic Level</span>
                        <span className="timeline-date">{student.level}</span>
                      </div>
                      <div className="timeline-item">
                        <span className="timeline-label">Session</span>
                        <span className="timeline-date">{student.session}</span>
                      </div>
                      <div className="timeline-item">
                        <span className="timeline-label">Current GPA</span>
                        <span className="timeline-date">{student.gpa}</span>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: '0.88rem',
                        color: 'var(--color-ink-soft)',
                        margin: '12px 0',
                        lineHeight: '1.45',
                      }}
                    >
                      {student.bio}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                      onClick={() => setSelectedStudent(student)}
                    >
                      {hasSubmitted ? 'View Profile & Docs' : 'View Profile'}
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      style={{
                        flex: 1.2,
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                      onClick={() => setRequestDocStudent(student)}
                    >
                      Request More
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Modal: Public Profile Viewer */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(31, 23, 19, 0.72)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
            overflowY: 'auto',
          }}
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '660px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="section-header"
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-paper-light, #faf6f0)',
                margin: 0,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{selectedStudent.name}</h3>
                <p className="section-meta" style={{ margin: '4px 0 0' }}>
                  {selectedStudent.programme} • {selectedStudent.institution}
                </p>
              </div>
              <button
                type="button"
                className="action-button"
                onClick={() => setSelectedStudent(null)}
                style={{ fontSize: '1.2rem', padding: '4px 8px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Submitted Documents Section (if student submitted files for this sponsor) */}
              {selectedStudent.documentRequest?.submittedDocuments?.length > 0 && (
                <div
                  style={{
                    marginBottom: '20px',
                    background: '#f0fdf4',
                    padding: '18px 20px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ color: '#166534', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
                      <span>✓</span> Submitted Verification Documents
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                      Submitted {new Date(selectedStudent.documentRequest.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: '#166534' }}>
                    The student has provided the following documents in response to your request:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedStudent.documentRequest.submittedDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#ffffff',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #dcfce7',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#166534' }}>
                            {doc.type || doc.name}
                          </strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '2px' }}>
                            File: {doc.name}
                          </div>
                        </div>
                        <a
                          href={doc.cloudinaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="secondary-button"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.82rem',
                            color: '#15803d',
                            borderColor: '#86efac',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          View / Download ↗
                        </a>
                      </div>
                    ))}
                  </div>

                  {selectedStudent.documentRequest.studentNote && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.86rem',
                        color: '#166534',
                        border: '1px dashed #bbf7d0',
                      }}
                    >
                      <strong>Student Note:</strong> "{selectedStudent.documentRequest.studentNote}"
                    </div>
                  )}
                </div>
              )}

              {/* Pending Request Notice */}
              {selectedStudent.documentRequest?.status === 'Pending' && (
                <div
                  style={{
                    marginBottom: '20px',
                    background: '#fffbeb',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid #fde68a',
                    fontSize: '0.88rem',
                    color: '#92400e',
                  }}
                >
                  ⏳ <strong>Document Request Pending:</strong> You requested verification documents (
                  {selectedStudent.documentRequest.requestedDocuments?.join(', ')}) on{' '}
                  {new Date(selectedStudent.documentRequest.createdAt).toLocaleDateString()}. Waiting for the student's submission.
                </div>
              )}

              {/* Academic Highlights */}
              <div className="review-section" style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: 'var(--color-ink)' }}>Academic Highlights</h4>
                <dl className="review-fields" style={{ marginTop: '8px' }}>
                  <dt>Institution:</dt>
                  <dd>{selectedStudent.institution}</dd>
                  <dt>Department:</dt>
                  <dd>{selectedStudent.department}</dd>
                  <dt>Level:</dt>
                  <dd>{selectedStudent.level}</dd>
                  <dt>Current Session:</dt>
                  <dd>{selectedStudent.session}</dd>
                  <dt>Cumulative GPA:</dt>
                  <dd><strong>{selectedStudent.gpa} / 4.00</strong></dd>
                </dl>
              </div>

              {/* Background & Aspirations */}
              <div className="review-section" style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--color-ink)' }}>Background & Aspirations</h4>
                <p className="review-text" style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>
                  {selectedStudent.bio}
                </p>
                {selectedStudent.careerGoal && (
                  <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'var(--color-ink-soft)' }}>
                    <strong>Career Aspiration:</strong> {selectedStudent.careerGoal}
                  </p>
                )}
              </div>

              {/* Key Focus & Skills */}
              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div className="review-section" style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--color-ink)' }}>Key Focus & Skills</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {selectedStudent.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          padding: '4px 10px',
                          background: 'rgba(139, 94, 60, 0.1)',
                          color: 'var(--color-accent-strong)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-paper-light, #faf6f0)',
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedStudent(null)}
              >
                Close Profile
              </button>
              <button
                type="button"
                className="primary-button"
                style={{
                  fontWeight: 600,
                  background: '#d97706',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '8px',
                }}
                onClick={() => {
                  const studentToRequest = selectedStudent
                  setSelectedStudent(null)
                  setRequestDocStudent(studentToRequest)
                }}
              >
                Request More Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Documents Action */}
      {requestDocStudent && (
        <RequestDocumentsModal
          student={requestDocStudent}
          onClose={() => setRequestDocStudent(null)}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  )
}
