import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api.js'

const STANDARD_DOCUMENTS = [
  { id: 'transcript', label: 'Official Academic Transcript (Latest Semester/Session)' },
  { id: 'student_id', label: 'Valid Student ID Card / Proof of Enrollment' },
  { id: 'indigence_letter', label: 'Letter of Indigence / Proof of Financial Hardship' },
  { id: 'recommendation', label: 'Academic Recommendation / HOD Attestation' },
  { id: 'state_origin', label: 'State of Origin / Local Government Certificate' },
]

export default function RequestDocumentsModal({
  student,
  applicationId = null,
  onClose,
  onSuccess,
}) {
  const [sponsorships, setSponsorships] = useState([])
  const [selectedSponsorshipId, setSelectedSponsorshipId] = useState('')
  const [selectedDocs, setSelectedDocs] = useState([
    'Official Academic Transcript (Latest Semester/Session)',
    'Valid Student ID Card / Proof of Enrollment',
  ])
  const [customDoc, setCustomDoc] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadSponsorships() {
      try {
        const { data } = await api.get('/sponsorships')
        setSponsorships(data)
        if (data && data.length > 0 && !selectedSponsorshipId) {
          setSelectedSponsorshipId(data[0]._id)
        }
      } catch (err) {
        console.warn('Could not load sponsor opportunities:', err)
      }
    }
    loadSponsorships()
  }, [])

  const handleToggleDoc = (docLabel) => {
    setSelectedDocs((prev) =>
      prev.includes(docLabel)
        ? prev.filter((d) => d !== docLabel)
        : [...prev, docLabel]
    )
  }

  const handleAddCustomDoc = (e) => {
    e.preventDefault()
    if (!customDoc.trim()) return
    if (!selectedDocs.includes(customDoc.trim())) {
      setSelectedDocs((prev) => [...prev, customDoc.trim()])
    }
    setCustomDoc('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (selectedDocs.length === 0) {
      setErrorMessage('Please select at least one document to request.')
      return
    }

    if (!message.trim()) {
      setErrorMessage('Please include a personal note or instructions for the student.')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post('/document-requests', {
        studentId: student.userId || student.id,
        studentEmail: student.email,
        sponsorshipId: selectedSponsorshipId || null,
        applicationId: applicationId || null,
        requestedDocuments: selectedDocs,
        message: message.trim(),
      })

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      console.error('Failed to send document request:', err)
      setErrorMessage(
        err.response?.data?.message || 'Failed to send document request. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(31, 23, 19, 0.72)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 9999,
        padding: '20px',
        backdropFilter: 'blur(4px)',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '620px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            background: 'var(--color-paper-light, #faf6f0)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.2rem' }}>📑</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-ink)' }}>
                Reach Out for Necessary Documents
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-ink-soft)' }}>
              Contact <strong>{student.name}</strong> ({student.programme} • {student.institution})
            </p>
          </div>
          <button
            type="button"
            className="action-button"
            onClick={onClose}
            style={{ fontSize: '1.2rem', padding: '4px 8px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#991b1b',
                fontSize: '0.9rem',
                marginBottom: '18px',
                border: '1px solid #fecaca',
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Associated Sponsorship */}
          <div className="field-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              Associated Scholarship Opportunity (Optional)
            </label>
            <select
              value={selectedSponsorshipId}
              onChange={(e) => setSelectedSponsorshipId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: '#fff',
                fontSize: '0.92rem',
              }}
            >
              <option value="">General Pre-Sponsorship Screening (No specific opportunity)</option>
              {sponsorships.map((sp) => (
                <option key={sp._id} value={sp._id}>
                  {sp.title} (₦{(sp.grantAmount || 250000).toLocaleString()})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '4px', display: 'block' }}>
              The student will see which scholarship fund this inquiry is associated with.
            </span>
          </div>

          {/* Document Checklist */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                Required Verification Documents ({selectedDocs.length} selected)
              </label>
            </div>
            <div
              style={{
                background: '#faf6f0',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {STANDARD_DOCUMENTS.map((doc) => {
                const isChecked = selectedDocs.includes(doc.label)
                return (
                  <label
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      padding: '4px 0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleDoc(doc.label)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                    />
                    <span>{doc.label}</span>
                  </label>
                )
              })}

              {/* Show any extra custom selected docs */}
              {selectedDocs
                .filter((d) => !STANDARD_DOCUMENTS.some((s) => s.label === d))
                .map((custom) => (
                  <div
                    key={custom}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                    }}
                  >
                    <span>📄 {custom}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleDoc(custom)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>

            {/* Add Custom Document Input */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Request other specific document (e.g. Utility Bill, WAEC Result)..."
                value={customDoc}
                onChange={(e) => setCustomDoc(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.88rem',
                }}
              />
              <button
                type="button"
                className="secondary-button"
                style={{ padding: '8px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                onClick={handleAddCustomDoc}
              >
                + Add Document
              </button>
            </div>
          </div>

          {/* Sponsor's Note / Message */}
          <div className="field-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              Message / Instructions for Student <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Hello, we reviewed your academic profile and are interested in considering you for our scholarship. Please provide your latest 300L second-semester transcript and proof of registration so we can verify your progress."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                lineHeight: 1.4,
              }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
              style={{ minWidth: '160px', fontWeight: 600 }}
            >
              {isSubmitting ? 'Sending Request...' : 'Send Document Request'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
