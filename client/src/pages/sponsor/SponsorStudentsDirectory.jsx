import { useState } from 'react'

const directoryStudents = [
  {
    id: 'stud-01',
    name: 'Alex Johnson',
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
  const [students] = useState(directoryStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInstitution, setSelectedInstitution] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState(null)

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

  return (
    <div className="sponsorships-browser">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2>Students Seeking Sponsorship</h2>
          <p className="section-meta">
            Discover verified students who have opted into the public sponsor directory.
          </p>
        </div>
      </div>

      {/* Privacy Notice Banner according to Section 10 */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: '#fffaf7',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          fontSize: '0.88rem',
          color: 'var(--color-ink-soft)',
          marginBottom: '20px',
        }}
      >
        🔒 <strong>Student Privacy Guard:</strong> This directory displays academic highlights only. Sensitive documents (transcripts, national IDs, and verification records) remain strictly private until a student formally applies to your specific sponsorship opportunity.
      </div>

      {/* Search & Filters */}
      <section className="filters-section" style={{ padding: '20px' }}>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Student or Programme</label>
            <input
              type="text"
              placeholder="e.g. Computer Science, Alex, Unilag..."
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
        <div className="content-grid">
          {filtered.map((student) => (
            <div key={student.id} className="card">
              <div className="card-header">
                <div>
                  <h4>{student.name}</h4>
                  <p className="card-meta">
                    {student.programme} • {student.institution}
                  </p>
                </div>
                <span className="badge badge-success">✓ Seeking Sponsorship</span>
              </div>

              <div className="timeline" style={{ margin: '12px 0' }}>
                <div className="timeline-item">
                  <span className="timeline-label">Academic Level</span>
                  <span className="timeline-date">{student.level}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Academic Session</span>
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
                  lineHeight: '1.4',
                }}
              >
                {student.bio}
              </p>

              <button
                type="button"
                className="secondary-button"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => setSelectedStudent(student)}
              >
                View Public Profile
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Modal: Public Profile Viewer */}
      {selectedStudent && (
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
          <div className="card" style={{ maxWidth: '620px', width: '100%' }}>
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <div>
                <h3>{selectedStudent.name}</h3>
                <p className="section-meta">
                  {selectedStudent.programme} • {selectedStudent.institution}
                </p>
              </div>
              <button
                type="button"
                className="action-button"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="review-section" style={{ marginBottom: '16px' }}>
              <h4>Academic Highlights</h4>
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

            <div className="review-section" style={{ marginBottom: '16px' }}>
              <h4>Background & Aspirations</h4>
              <p className="review-text" style={{ marginTop: '6px' }}>
                {selectedStudent.bio}
              </p>
            </div>

            <div className="review-section" style={{ marginBottom: '16px' }}>
              <h4>Key Focus & Skills</h4>
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

            <div
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.82rem', color: 'var(--color-ink-soft)' }}>
                Status: Verified Student Profile
              </span>
              <button
                type="button"
                className="primary-button"
                onClick={() => setSelectedStudent(null)}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

