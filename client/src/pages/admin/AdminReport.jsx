import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminReport() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/report')
      setReport(data)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert(error.response?.data?.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Generating System Report...</h3>
        <p style={{ color: 'var(--color-ink-soft)' }}>
          Aggregating user registrations, sponsorship metrics, disbursement totals, and fraud engine analytics...
        </p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Failed to compile system report.</h3>
        <button className="primary-button" onClick={fetchReport} style={{ marginTop: '16px' }}>
          Retry
        </button>
      </div>
    )
  }

  const { users, sponsorships, applications, finances, fraudDetection } = report

  return (
    <div className="student-dashboard print-container">
      {/* Header and Print Action */}
      <section className="dashboard-welcome">
        <div className="section-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>System Performance & Fraud Audit Report</h3>
            <p className="section-meta">
              Comprehensive operational summary generated on {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="hide-on-print" style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="secondary-button" onClick={fetchReport}>
              Refresh Data
            </button>
            <button type="button" className="primary-button" onClick={handlePrint}>
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      </section>

      {/* Primary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card" style={{ borderTop: '4px solid #16a34a' }}>
          <div className="stat-value" style={{ fontSize: '1.6rem', color: '#16a34a' }}>
            ₦{finances.totalDisbursedAmount.toLocaleString()}
          </div>
          <div className="stat-label">Total Funds Disbursed via Paystack</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="stat-value">{applications.total}</div>
          <div className="stat-label">Total Applications Submitted</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="stat-value">{users.total}</div>
          <div className="stat-label">Registered Accounts</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #eab308' }}>
          <div className="stat-value">{fraudDetection.totalFlagged}</div>
          <div className="stat-label">Fraud Incidents Intercepted</div>
        </div>
      </div>

      {/* Grid of Analytical Breakdown Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Section 1: User Demographics */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', borderBottom: '1px solid var(--color-paper-border)', paddingBottom: '8px' }}>
            👥 Multi-Role User Demographics
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Student Applicants:</span>
              <strong>{users.students}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Verified Sponsors:</span>
              <strong>{users.sponsors}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>System Administrators:</span>
              <strong>{users.admins}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-paper-border)', paddingTop: '8px' }}>
              <strong>Total Active Users:</strong>
              <strong style={{ color: 'var(--color-primary)' }}>{users.total}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Sponsorship Opportunities */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', borderBottom: '1px solid var(--color-paper-border)', paddingBottom: '8px' }}>
            🎓 Sponsorship Opportunities
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Open Opportunities:</span>
              <strong style={{ color: '#16a34a' }}>{sponsorships.open}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Closed / Completed:</span>
              <strong style={{ color: '#6b7280' }}>{sponsorships.closed}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-paper-border)', paddingTop: '8px' }}>
              <strong>Total Opportunities Created:</strong>
              <strong style={{ color: 'var(--color-primary)' }}>{sponsorships.total}</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Application Pipeline Status */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', borderBottom: '1px solid var(--color-paper-border)', paddingBottom: '8px' }}>
            📑 Application Pipeline Breakdown
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Grant Disbursed:</span>
              <strong style={{ color: '#16a34a' }}>{applications.disbursed}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Approved (Pending Payout):</span>
              <strong>{applications.approved}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Under Sponsor Review (Clean):</span>
              <strong>{applications.underSponsorReview}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Under Admin Review (Flagged):</span>
              <strong style={{ color: '#eab308' }}>{applications.underAdminReview}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Awaiting Info from Student:</span>
              <strong style={{ color: '#3b82f6' }}>{applications.waitingForInfo}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Rejected:</span>
              <strong style={{ color: '#dc2626' }}>{applications.rejected}</strong>
            </div>
          </div>
        </div>

        {/* Section 4: Rule-Based Fraud Engine Intelligence */}
        <div className="card" style={{ padding: '24px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', borderBottom: '1px solid var(--color-paper-border)', paddingBottom: '8px' }}>
            🛡️ Fraud Engine & Security Metrics
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Passed Automated Screening:</span>
              <strong style={{ color: '#16a34a' }}>{fraudDetection.cleanPassed}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>Intercepted by Rules:</span>
              <strong style={{ color: '#dc2626' }}>{fraudDetection.totalFlagged}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>• High Risk (e.g. Reused Hashes):</span>
              <strong style={{ color: '#dc2626' }}>{fraudDetection.riskLevels.high}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>• Medium Risk (Academic Mismatch):</span>
              <strong style={{ color: '#ea580c' }}>{fraudDetection.riskLevels.medium}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-ink-soft)' }}>• Low Risk (Recycled Text):</span>
              <strong style={{ color: '#eab308' }}>{fraudDetection.riskLevels.low}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Project Metadata Footer */}
      <div className="card wide" style={{ backgroundColor: '#f8fafc', padding: '20px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--color-ink)' }}>
          Research & Project Verification Note
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-ink-soft)', lineHeight: '1.6' }}>
          This report verifies the functional execution of the <strong>Scholar</strong> platform developed in accordance with the specification in <em>Chapters 1 through 3</em> (University of Nigeria, Nsukka, Department of Computer Science). All fraud detection rules, role-based workflows, and Paystack financial transactions are logged cryptographically.
        </p>
      </div>
    </div>
  )
}

