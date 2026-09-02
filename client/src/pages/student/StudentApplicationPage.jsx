import { useParams, useNavigate } from 'react-router-dom'
import ApplicationFormWizard from '../../components/ApplicationFormWizard'

export default function StudentApplicationPage() {
  const { appId } = useParams()
  const navigate = useNavigate()

  // Mock sponsorship data
  const sponsorshipData = {
    id: 'opp-042',
    title: 'Full Tuition + Living Expenses',
    sponsor: 'Merit Foundation',
    amount: 80000,
    description: 'Merit-based full sponsorship for high-performing students',
    deadline: '2026-09-20',
  }

  const handleSubmit = async (formData) => {
    // In Phase 6, this will send data to backend API
    // For now, mock the submission
    console.log('Application submitted:', formData)
    
    // Show success message and navigate
    alert('Application submitted successfully!')
    navigate('/student')
  }

  return (
    <div className="application-page">
      <div className="application-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div>
          <h3>New Application</h3>
          <p className="application-meta">{sponsorshipData.title} • {sponsorshipData.sponsor}</p>
        </div>
      </div>

      <div className="application-container">
        <div className="application-sidebar">
          <div className="sponsorship-info card">
            <h4>{sponsorshipData.title}</h4>
            <p className="sponsor-name">{sponsorshipData.sponsor}</p>

            <div className="info-item">
              <span className="label">Award Amount</span>
              <span className="value">${(sponsorshipData.amount / 1000).toFixed(0)}k</span>
            </div>

            <div className="info-item">
              <span className="label">Deadline</span>
              <span className="value">{sponsorshipData.deadline}</span>
            </div>

            <p className="sponsorship-description">{sponsorshipData.description}</p>

            <div className="save-draft-notice">
              <p>💾 <strong>Auto-save enabled:</strong> Your progress is saved at each step</p>
            </div>
          </div>
        </div>

        <div className="application-main">
          <ApplicationFormWizard
            sponsorshipId={sponsorshipData.id}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}
