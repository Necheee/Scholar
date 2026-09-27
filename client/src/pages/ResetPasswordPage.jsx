import { useState } from 'react'
import AuthLayout from './AuthLayout.jsx'
import api from '../services/api.js'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('No reset token found in the URL. Please request a new link.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const res = await api.post(`/auth/resetpassword/${token}`, { password: form.password })
      setMessage('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Choose a new password"
      description="Create a secure password to continue accessing your account."
      footerText="Ready to sign in?"
      footerLink="Log in"
      footerTo="/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <div className="field-group">
          <label htmlFor="new-password">New password</label>
          <input id="new-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="New password" required minLength="6" />
        </div>

        <div className="field-group">
          <label htmlFor="new-confirm-password">Confirm password</label>
          <input id="new-confirm-password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm new password" required minLength="6" />
        </div>

        <button type="submit" className="primary-button auth-button" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  )
}
