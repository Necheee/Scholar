import { useState } from 'react'
import AuthLayout from './AuthLayout.jsx'

const defaultForm = {
  name: '',
  email: '',
  role: 'student',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState(defaultForm)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    console.log('Registration submitted', form)
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
        <div className="field-group">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
        </div>

        <div className="field-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="sponsor">Sponsor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" />
        </div>

        <div className="field-group">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm your password" />
        </div>

        <button type="submit" className="primary-button auth-button">
          Create account
        </button>
      </form>
    </AuthLayout>
  )
}
