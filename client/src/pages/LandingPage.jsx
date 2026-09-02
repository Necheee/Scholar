import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <div className="landing-card">
        <div className="landing-intro">
          <span className="auth-kicker">Secure student sponsorship</span>
          <h1>Find opportunity. Manage trust. Move faster.</h1>
          <p>
            Scholar helps students, sponsors, and admins manage sponsorship requests with secure
            workflows, clear role boundaries, and transparent review steps.
          </p>
        </div>

        <div className="landing-actions">
          <Link to="/login" className="primary-button landing-button">
            Log in
          </Link>
          <Link to="/register" className="secondary-button landing-button">
            Create account
          </Link>
        </div>

        <div className="landing-grid">
          <div className="mini-card">
            <h3>Students</h3>
            <p>Track one active application and respond to requests clearly.</p>
          </div>
          <div className="mini-card">
            <h3>Sponsors</h3>
            <p>Review applications, manage opportunities, and act ethically.</p>
          </div>
          <div className="mini-card wide">
            <h3>Admins</h3>
            <p>Review flagged applications, support information requests, and monitor trends.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
