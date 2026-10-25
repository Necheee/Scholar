import { useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api.js'

export default function StudentDocumentUploadModal({
  docRequest,
  onClose,
  onSuccess,
}) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [studentNote, setStudentNote] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const requestedDocs = docRequest.requestedDocuments || [
    'Academic Transcript',
    'Proof of Enrollment',
  ]

  const handleFileUpload = async (e, docType) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5242880) {
      alert(`File "${file.name}" exceeds the 5MB size limit.`)
      return
    }

    try {
      setIsUploading(true)
      setErrorMessage('')
      const formData = new FormData()
      formData.append('document', file)

      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newDoc = {
        name: file.name,
        type: docType,
        cloudinaryUrl: data.url,
        cloudinaryId: data.cloudinaryId,
        fileHash: data.fileHash,
      }

      setUploadedFiles((prev) => {
        // Replace if already uploaded for this type or add
        const filtered = prev.filter((d) => d.type !== docType)
        return [...filtered, newDoc]
      })
    } catch (err) {
      console.error('File upload failed:', err)
      setErrorMessage(err.response?.data?.message || err.message || 'File upload failed.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = (docType) => {
    setUploadedFiles((prev) => prev.filter((d) => d.type !== docType))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (uploadedFiles.length === 0) {
      setErrorMessage('Please upload at least one requested document before submitting.')
      return
    }

    try {
      setIsSubmitting(true)
      await api.put(`/document-requests/${docRequest._id}/submit`, {
        submittedDocuments: uploadedFiles,
        studentNote: studentNote.trim(),
      })

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err) {
      console.error('Failed to submit documents:', err)
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit documents. Please try again.'
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
          maxWidth: '650px',
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
              <span style={{ fontSize: '1.2rem' }}>📤</span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-ink)' }}>
                Upload Requested Documents
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--color-ink-soft)' }}>
              Requested by <strong>{docRequest.sponsor?.name || 'Sponsor'}</strong>
              {docRequest.sponsorship?.title && ` for "${docRequest.sponsorship.title}"`}
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

          {/* Sponsor Note Banner */}
          {docRequest.message && (
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                background: '#fffaf0',
                border: '1px solid #fef3c7',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Note from {docRequest.sponsor?.name || 'Sponsor'}:
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#78350f', lineHeight: 1.45 }}>
                "{docRequest.message}"
              </p>
            </div>
          )}

          {/* Upload Checklist */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.92rem', marginBottom: '10px' }}>
              Upload Required Documents ({uploadedFiles.length} of {requestedDocs.length} uploaded)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requestedDocs.map((docType) => {
                const uploaded = uploadedFiles.find((f) => f.type === docType)
                return (
                  <div
                    key={docType}
                    style={{
                      border: uploaded ? '1px solid #86efac' : '1px solid var(--color-border)',
                      background: uploaded ? '#f0fdf4' : '#fafafa',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                        {uploaded ? '✓' : '•'} {docType}
                      </div>
                      {uploaded ? (
                        <div style={{ fontSize: '0.82rem', color: '#15803d', marginTop: '2px' }}>
                          Uploaded: <strong>{uploaded.name}</strong> •{' '}
                          <a
                            href={uploaded.cloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#15803d', textDecoration: 'underline' }}
                          >
                            Preview
                          </a>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)', marginTop: '2px' }}>
                          PDF, PNG, or JPG (max 5MB)
                        </div>
                      )}
                    </div>

                    <div>
                      {uploaded ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => handleRemoveFile(docType)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.82rem',
                            color: '#dc2626',
                            borderColor: '#fca5a5',
                          }}
                        >
                          Remove
                        </button>
                      ) : (
                        <label
                          className="primary-button"
                          style={{
                            padding: '6px 14px',
                            fontSize: '0.85rem',
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            display: 'inline-block',
                            margin: 0,
                          }}
                        >
                          {isUploading ? 'Uploading...' : 'Choose File'}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, docType)}
                            disabled={isUploading}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Student Note */}
          <div className="field-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              Your Response / Note to Sponsor (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Here are my verified documents. My 300L transcript is signed by the Academic Affairs officer."
              value={studentNote}
              onChange={(e) => setStudentNote(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                lineHeight: 1.4,
              }}
            />
          </div>

          {/* Footer Actions */}
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
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting || isUploading || uploadedFiles.length === 0}
              style={{ minWidth: '180px', fontWeight: 600 }}
            >
              {isSubmitting ? 'Submitting Documents...' : 'Submit to Sponsor'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
