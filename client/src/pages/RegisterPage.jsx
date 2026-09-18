import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from './AuthLayout.jsx'

const defaultForm = {
  name: '',
  email: '',
  role: 'Student', // Backend expects capitalized
  password: '',
  confirmPassword: '',
  institution: '',
  department: '',
  organizationName: '',
  description: '',
  website: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    try {
      const user = await register(form)
      if (user.role === 'Student') navigate('/student')
      else if (user.role === 'Sponsor') navigate('/sponsor')
      else if (user.role === 'Admin') navigate('/admin')
    } catch (err) {
      setError(err)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Choose your role and begin your sponsorship journey."
      footerText="Already have an account?"
      footerLink="Log in"
      footerTo="/login"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="error-alert" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        <div className="field-group">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
        </div>

        <div className="field-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            <option value="Student">Student</option>
            <option value="Sponsor">Sponsor</option>
          </select>
          <small>Admins cannot be created here.</small>
        </div>

        {form.role === 'Student' && (
          <>
            <div className="field-group">
              <label htmlFor="institution">Institution</label>
              <input id="institution" name="institution" value={form.institution} onChange={handleChange} placeholder="University name" required />
            </div>
            <div className="field-group">
              <label htmlFor="department">Department</label>
              <input id="department" name="department" value={form.department} onChange={handleChange} placeholder="e.g. Computer Science" required />
            </div>
          </>
        )}

        {form.role === 'Sponsor' && (
          <>
            <div className="field-group">
              <label htmlFor="organizationName">Organization Name</label>
              <input id="organizationName" name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="Company or Foundation" required />
            </div>
            <div className="field-group">
              <label htmlFor="website">Website (Optional)</label>
              <input id="website" name="website" value={form.website} onChange={handleChange} placeholder="https://" />
            </div>
          </>
        )}

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" required />
        </div>

        <div className="field-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required />
        </div>

        <button type="submit" className="primary-button auth-button">
          Create account
        </button>
      </form>
    </AuthLayout>
  )
}
