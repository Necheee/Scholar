import { useState } from 'react'

export default function ApplicationFormWizard({ sponsorshipId, onSubmit, initialData = null }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(
    initialData || {
      // Step 1: Academic Info
      school: '',
      year: 'freshman',
      major: '',
      gpa: '',
      
      // Step 2: Motivation
      motivation: '',
      goals: '',
      
      // Step 3: ID Document
      idDocument: null,
      idType: 'passport',
      
      // Step 4: Supporting Documents
      documents: [],
      
      // Step 5: Review
      agreeToTerms: false,
    }
  )

  const totalSteps = 5

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }))
  }

  const handleAddDocument = (file) => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { id: Date.now(), file, name: file.name }]
    }))
  }

  const handleRemoveDocument = (id) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }))
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.school && formData.major && formData.gpa
      case 2:
        return formData.motivation && formData.goals
      case 3:
        return formData.idDocument && formData.idType
      case 4:
        return formData.documents.length > 0
      case 5:
        return formData.agreeToTerms
      default:
        return false
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canProceedToNext()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="application-form-wizard">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="step-indicators">
          {[1, 2, 3, 4, 5].map(step => (
            <button
              key={step}
              className={`step-indicator ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
              onClick={() => step < currentStep && setCurrentStep(step)}
              disabled={step > currentStep}
            >
              {step < currentStep ? '✓' : step}
            </button>
          ))}
        </div>
        <p className="progress-text">Step {currentStep} of {totalSteps}</p>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Step 1: Academic Information */}
        {currentStep === 1 && (
          <fieldset className="form-step">
            <legend>Academic Information</legend>
            <p className="step-description">Tell us about your academic background</p>

            <div className="field-group">
              <label htmlFor="school">School / University</label>
              <input
                id="school"
                type="text"
                placeholder="e.g., Stanford University"
                value={formData.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="year">Year of Study</label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
              >
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="graduate">Graduate</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="major">Major / Field of Study</label>
              <input
                id="major"
                type="text"
                placeholder="e.g., Computer Science"
                value={formData.major}
                onChange={(e) => handleInputChange('major', e.target.value)}
                required
              />
            </div>

            <div className="field-group">
              <label htmlFor="gpa">Current GPA</label>
              <input
                id="gpa"
                type="number"
                placeholder="e.g., 3.75"
                min="0"
                max="4"
                step="0.01"
                value={formData.gpa}
                onChange={(e) => handleInputChange('gpa', e.target.value)}
                required
              />
            </div>
          </fieldset>
        )}

        {/* Step 2: Motivation */}
        {currentStep === 2 && (
          <fieldset className="form-step">
            <legend>Why This Sponsorship?</legend>
            <p className="step-description">Help sponsors understand your goals and commitment</p>

            <div className="field-group">
              <label htmlFor="motivation">Why are you applying for this sponsorship? (150-300 words)</label>
              <textarea
                id="motivation"
                placeholder="Share your motivation, career aspirations, and why this sponsorship is important to you..."
                rows="6"
                value={formData.motivation}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                required
              />
              <p className="field-hint">{formData.motivation.length} characters</p>
            </div>

            <div className="field-group">
              <label htmlFor="goals">Your Academic & Career Goals (150-300 words)</label>
              <textarea
                id="goals"
                placeholder="Describe your short and long-term goals, and how this sponsorship will help you achieve them..."
                rows="6"
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                required
              />
              <p className="field-hint">{formData.goals.length} characters</p>
            </div>
          </fieldset>
        )}

        {/* Step 3: ID Document */}
        {currentStep === 3 && (
          <fieldset className="form-step">
            <legend>Identification Document</legend>
            <p className="step-description">Upload a copy of your ID for verification</p>

            <div className="field-group">
              <label htmlFor="idType">ID Type</label>
              <select
                id="idType"
                value={formData.idType}
                onChange={(e) => handleInputChange('idType', e.target.value)}
              >
                <option value="passport">Passport</option>
                <option value="driver-license">Driver's License</option>
                <option value="national-id">National ID</option>
                <option value="student-id">Student ID</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="idDocument">Upload ID Document</label>
              <div className="file-upload-area">
                <input
                  id="idDocument"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => handleFileChange('idDocument', e.target.files?.[0])}
                  required
                />
                <p>PDF, JPG, or PNG (Max 5MB)</p>
                {formData.idDocument && (
                  <p className="file-selected">✓ {formData.idDocument.name}</p>
                )}
              </div>
            </div>
          </fieldset>
        )}

        {/* Step 4: Supporting Documents */}
        {currentStep === 4 && (
          <fieldset className="form-step">
            <legend>Supporting Documents</legend>
            <p className="step-description">Upload transcripts, certificates, or other supporting materials</p>

            <div className="field-group">
              <label htmlFor="supportingDocs">Upload Supporting Documents</label>
              <div className="file-upload-area">
                <input
                  id="supportingDocs"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(file => handleAddDocument(file))
                  }}
                />
                <p>PDF, Word, Excel, or Images (Max 5MB each)</p>
              </div>
            </div>

            {formData.documents.length > 0 && (
              <div className="documents-list">
                <h4>Uploaded Documents ({formData.documents.length})</h4>
                {formData.documents.map(doc => (
                  <div key={doc.id} className="document-item">
                    <span className="doc-name">{doc.name}</span>
                    <button
                      type="button"
                      className="doc-remove"
                      onClick={() => handleRemoveDocument(doc.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </fieldset>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <fieldset className="form-step">
            <legend>Review Your Application</legend>
            <p className="step-description">Please review all information before submitting</p>

            <div className="review-section">
              <h4>Academic Information</h4>
              <dl className="review-fields">
                <dt>School:</dt>
                <dd>{formData.school}</dd>
                <dt>Year:</dt>
                <dd>{formData.year}</dd>
                <dt>Major:</dt>
                <dd>{formData.major}</dd>
                <dt>GPA:</dt>
                <dd>{formData.gpa}</dd>
              </dl>
            </div>

            <div className="review-section">
              <h4>Application Statement</h4>
              <p className="review-text">{formData.motivation}</p>
            </div>

            <div className="review-section">
              <h4>Career Goals</h4>
              <p className="review-text">{formData.goals}</p>
            </div>

            <div className="review-section">
              <h4>Documents</h4>
              <ul className="review-list">
                <li>ID Document: {formData.idDocument?.name}</li>
                {formData.documents.map(doc => (
                  <li key={doc.id}>{doc.name}</li>
                ))}
              </ul>
            </div>

            <div className="field-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  required
                />
                <span>I confirm that all information provided is accurate and complete</span>
              </label>
            </div>
          </fieldset>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          <button
            type="button"
            className="secondary-button"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            ← Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              className="primary-button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceedToNext()}
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              className="primary-button accent"
              disabled={!canProceedToNext()}
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
