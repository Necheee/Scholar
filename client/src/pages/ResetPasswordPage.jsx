import { useState } from 'react'
import AuthLayout from './AuthLayout.jsx'

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' })

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    console.log('Password reset submitted', form)
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
        <div className="field-group">
          <label htmlFor="new-password">New password</label>
          <input id="new-password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="New password" />
        </div>

        <div className="field-group">
          <label htmlFor="new-confirm-password">Confirm password</label>
          <input id="new-confirm-password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm new password" />
        </div>

        <button type="submit" className="primary-button auth-button">
          Update password
        </button>
      </form>
    </AuthLayout>
  )
}
