import { useState } from 'react'
import AuthLayout from './AuthLayout.jsx'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    console.log('Password reset requested for', email)
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter the email address tied to your account and we will send a reset link."
      footerText="Remembered it?"
      footerLink="Back to login"
      footerTo="/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" className="primary-button auth-button">
          Send reset link
        </button>
      </form>
    </AuthLayout>
  )
}
