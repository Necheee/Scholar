import { useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api.js'

export default function ProvideInfoModal({ appId, reason = '', onClose, onRefresh }) {
  const [file, setFile] = useState(null)
  const [docType, setDocType] = useState('Academic Transcript')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const uploadFile = async (f) => {
    if (f.size > 5242880) {
      throw new Error(`File "${f.name}" exceeds the 5MB size limit.`);
    }
    const formData = new FormData()
    formData.append('document', f)
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return {
      cloudinaryUrl: data.url,
      cloudinaryId: data.cloudinaryId,
      fileHash: data.fileHash,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return setErrorMsg('Please select a file to upload.')
    setIsSubmitting(true)
    setErrorMsg('')
    try {
      const uploaded = await uploadFile(file)
      const documents = [{
        type: docType || 'Additional Information',
        ...uploaded
      }]
      
      await api.put(`/applications/${appId}/provide-info`, { documents })
      alert('Documents submitted successfully!')
      onRefresh()
      onClose()
    } catch (err) {
      console.error('Provide info failed:', err)
      setErrorMsg(err.response?.data?.message || err.message || 'Upload failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(31, 23, 19, 0.72)',
      display: 'grid', placeItems: 'center',
      zIndex: 9999, padding: '20px',
      backdropFilter: 'blur(4px)',
    }}
    onClick={onClose}
    >
      <div 
        className="card" 
        style={{ 
          maxWidth: '520px', 
          width: '100%', 
          backgroundColor: '#fff', 
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          margin: 'auto'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--color-paper-light, #faf6f0)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-ink)' }}>Provide Requested Documents</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
              Submit missing verification documents requested by the reviewer.
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

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.88rem',
              marginBottom: '16px',
              border: '1px solid #fecaca'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {reason && (
            <div style={{
              background: '#fffaf0',
              border: '1px solid #fef3c7',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '18px',
              color: '#92400e',
              fontSize: '0.9rem',
              lineHeight: 1.45
            }}>
              <strong>Reviewer Instructions:</strong> "{reason}"
            </div>
          )}

          <div className="field-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              Document Category
            </label>
            <select
              value={docType}
              onChange={e => setDocType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: '#fff',
                fontSize: '0.92rem'
              }}
            >
              <option value="Official Academic Transcript">Official Academic Transcript</option>
              <option value="Proof of University Enrollment / Student ID">Proof of University Enrollment / Student ID</option>
              <option value="Letter of Indigence / Financial Hardship">Letter of Indigence / Financial Hardship</option>
              <option value="Academic Recommendation Letter">Academic Recommendation Letter</option>
              <option value="State of Origin / LGA Certificate">State of Origin / LGA Certificate</option>
              <option value="Additional Supporting Document">Additional Supporting Document</option>
            </select>
          </div>

          <div className="field-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              Select File (PDF, PNG, JPG - max 5MB)
            </label>
            <input 
              type="file" 
              required 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => setFile(e.target.files[0])} 
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: '#fafafa',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--color-border)'
          }}>
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
              style={{ minWidth: '150px', fontWeight: 600 }}
            >
              {isSubmitting ? 'Uploading...' : 'Submit Document'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
