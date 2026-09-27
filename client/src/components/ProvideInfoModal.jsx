import { useState } from 'react'
import api from '../services/api.js'

export default function ProvideInfoModal({ appId, onClose, onRefresh }) {
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
      cloudinaryId: data.cloudinaryId
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return alert('Please select a file')
    setIsSubmitting(true)
    try {
      const uploaded = await uploadFile(file)
      const documents = [{
        type: 'Additional Information',
        ...uploaded
      }]
      
      await api.put(`/applications/${appId}/provide-info`, { documents })
      alert('Information provided successfully!')
      onRefresh()
      onClose()
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ padding: '30px', maxWidth: '400px', width: '100%' }}>
        <h3>Provide Additional Information</h3>
        <p style={{ color: 'var(--color-ink-soft)', marginBottom: '20px' }}>
          Please upload the requested missing document.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <input type="file" required onChange={e => setFile(e.target.files[0])} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="secondary-button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="primary-button accent" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
