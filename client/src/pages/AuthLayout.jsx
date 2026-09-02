import { Link } from 'react-router-dom'

export default function AuthLayout({
  title,
  description,
  children,
  footerText,
  footerLink,
  footerTo,
}) {
  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <div className="auth-hero-badge">Scholar</div>
        <p className="auth-kicker">Secure sponsorship management</p>
        <h1>{title}</h1>
        <p className="auth-hero-copy">{description}</p>

        <div className="auth-hero-points">
          <span>Role-based access</span>
          <span>Application workflow</span>
          <span>Fraud-aware review</span>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {children}

          {footerText && (
            <p className="auth-footer">
              {footerText}{' '}
              <Link to={footerTo}>{footerLink}</Link>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
