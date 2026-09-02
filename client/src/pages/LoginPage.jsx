import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from './AuthLayout.jsx'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.email) return
    
    // Mock login: infer role from email domain for demo purposes
    const role = form.email.includes('sponsor') ? 'sponsor' : form.email.includes('admin') ? 'admin' : 'student'
    login(form.email, role)
    navigate(`/${role}`)
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

      <div className="auth-hint">
        <p><strong>Demo hint:</strong> Use emails containing "sponsor" or "admin" to test different roles (e.g., sponsor@example.com)</p>
      </div>
    </AuthLayout>
  )
}
