import { useState } from 'react'
import AuthLayout from './AuthLayout.jsx'
import api from '../services/api.js'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setIsLoading(true)

    try {
      const res = await api.post('/auth/forgotpassword', { email })
      
      // Since we don't have a real email server, we show the dev token directly to the user for testing!
      if (res.data._dev_token) {
        setMessage(`Success! (DEV MODE): Go to http://localhost:3000/reset-password?token=${res.data._dev_token}`)
      } else {
        setMessage('Check your email for the reset link!')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
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
        {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <div className="field-group">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <button type="submit" className="primary-button auth-button" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </AuthLayout>
  )
}
