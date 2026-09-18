import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ApplicationFormWizard from '../../components/ApplicationFormWizard'
import api from '../../services/api'

export default function StudentApplicationPage() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use the sponsorship data passed from the navigation state if available
  const sponsorshipData = state?.sponsorship || {
    _id: appId,
    title: 'Loading Opportunity...',
  }

  const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('document', file)
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return {
      cloudinaryUrl: data.url,
      cloudinaryId: data.cloudinaryId
    }
  }

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      const documents = []
      
      // Upload ID Document
      if (formData.idDocument) {
        const uploaded = await uploadFile(formData.idDocument)
        documents.push({
          type: formData.idType || 'ID Document',
          ...uploaded
        })
      }
      
      // Upload Supporting Documents
      if (formData.documents && formData.documents.length > 0) {
        for (const file of formData.documents) {
          const uploaded = await uploadFile(file)
          documents.push({
            type: 'Supporting Document',
            ...uploaded
          })
        }
      }

      // Build payload matching Application model
      const payload = {
        sponsorshipId: appId,
        reasonForRequesting: formData.motivation + (formData.goals ? `\n\nGoals: ${formData.goals}` : ''),
        academicInfoSnapshot: {
          session: '2025/2026',
          level: formData.year,
          programme: formData.major
        },
        documents
      }

      await api.post('/applications', payload)
      
      alert('Application submitted successfully! Our automated system will now screen your application.')
      navigate('/student/applications')
    } catch (error) {
      console.error('Submission failed:', error)
      alert(error.response?.data?.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="application-page">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2>Apply for Sponsorship</h2>
          <p className="section-meta">
            You are applying for <strong>{sponsorshipData.title}</strong>
          </p>
        </div>
      </div>

      <div className="card">
        {isSubmitting ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '12px' }}>Submitting your application...</h3>
            <p style={{ color: 'var(--color-ink-soft)' }}>
              Please wait while we securely upload your documents and process your request.
            </p>
          </div>
        ) : (
          <ApplicationFormWizard 
            sponsorshipId={appId}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
