import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from './AuthLayout.jsx'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.email || !form.password) return
    
    setError('')
    try {
      const user = await login(form.email, form.password)
      // Navigate based on the actual role returned by the backend
      if (user.role === 'Student') navigate('/student')
      else if (user.role === 'Sponsor') navigate('/sponsor')
      else if (user.role === 'Admin') navigate('/admin')
    } catch (err) {
      setError(err)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Access your student, sponsor, or admin workspace."
      footerText="Need an account?"
      footerLink="Create one"
      footerTo="/register"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="error-alert" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-row between">
          <label className="checkbox-row">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" className="primary-button auth-button">
          Log in
        </button>
      </form>

    </AuthLayout>
  )
}
