import { useState, useEffect } from 'react'
import api from '../../services/api'
import PaymentReceiptModal from '../../components/PaymentReceiptModal'

export default function SponsorTransactions() {
  const [data, setData] = useState({
    totalDisbursed: 0,
    transactionCount: 0,
    successfulCount: 0,
    transactions: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeReceiptAppId, setActiveReceiptAppId] = useState(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const res = await api.get('/payments/my-transactions')
      setData(res.data)
    } catch (error) {
      console.error('Failed to load transaction history:', error)
      alert(error.response?.data?.message || 'Failed to load transaction history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <div className="student-dashboard">
      <section className="dashboard-welcome">
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div>
            <h3>Wallet & Disbursement Transactions</h3>
            <p className="section-meta">
              Official financial ledger of tuition grants disbursed via Paystack (Chapter 3.4.2 & 3.4.5 Wallet/Transaction).
            </p>
          </div>
          <button type="button" className="secondary-button" onClick={fetchTransactions}>
            Refresh Ledger
          </button>
        </div>
      </section>

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card" style={{ borderTop: '4px solid #16a34a' }}>
          <div className="stat-value" style={{ color: '#16a34a', fontSize: '1.6rem' }}>
            ₦{data.totalDisbursed.toLocaleString()}
          </div>
          <div className="stat-label">Total Cumulative Disbursed</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="stat-value">{data.successfulCount}</div>
          <div className="stat-label">Successful Grant Payouts</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #6b7280' }}>
          <div className="stat-value">{data.transactionCount}</div>
          <div className="stat-label">Total Transaction Records</div>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="active-section">
        <div className="card wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Disbursement Audit Ledger</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
              Integrated with Paystack Nigeria
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>Loading wallet transactions...</div>
          ) : data.transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--color-ink-soft)', marginBottom: '8px' }}>
                No disbursement transactions recorded yet.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)' }}>
                When you approve and fund student applications, your Paystack transaction details and receipts will appear here.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Beneficiary Student</th>
                    <th>Scholarship Opportunity</th>
                    <th>Grant Amount</th>
                    <th>Channel</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {tx.reference}
                        </strong>
                      </td>
                      <td>
                        <strong>{tx.student?.name || 'Applicant'}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-soft)' }}>
                          {tx.student?.email}
                        </div>
                      </td>
                      <td>{tx.sponsorship?.title || 'Scholarship Grant'}</td>
                      <td>
                        <strong style={{ color: '#16a34a' }}>
                          ₦{tx.amount.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                          {tx.channel || 'Card'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {new Date(tx.paidAt || tx.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-ink-soft)' }}>
                          {new Date(tx.paidAt || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          backgroundColor: tx.status === 'Success' ? '#dcfce7' : '#fef9c3',
                          color: tx.status === 'Success' ? '#166534' : '#854d0e',
                        }}>
                          {tx.status === 'Success' ? '✓ Successful' : tx.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                          onClick={() => setActiveReceiptAppId(tx.application?._id || tx.application)}
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Payment Receipt Popup Modal */}
      {activeReceiptAppId && (
        <PaymentReceiptModal
          applicationId={activeReceiptAppId}
          onClose={() => setActiveReceiptAppId(null)}
        />
      )}
    </div>
  )
}

