import { useState, useEffect } from 'react'
import api from '../services/api'

export default function PaymentReceiptModal({ applicationId, onClose }) {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchReceipt() {
      try {
        setLoading(true)
        const { data } = await api.get(`/payments/receipt/${applicationId}`)
        setReceipt(data)
      } catch (err) {
        console.error('Failed to load receipt:', err)
        setError(err.response?.data?.message || 'Failed to load transaction receipt')
      } finally {
        setLoading(false)
      }
    }
    fetchReceipt()
  }, [applicationId])

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      style={{ zIndex: 1200 }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '520px', 
          width: '100%', 
          padding: '0', 
          overflow: 'hidden',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          background: '#ffffff',
          position: 'relative'
        }}
      >
        <div style={{ background: '#092440', color: '#ffffff', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>🧾</span>
            <div>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem' }}>Disbursement Receipt</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#8fb1d1' }}>Official Paystack Transaction Record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '28px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Loading transaction record...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#dc2626' }}>{error}</div>
          ) : receipt ? (
            <div>
              <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Total Amount Disbursed
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>
                  ₦{receipt.amount?.toLocaleString()}
                </div>
                <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginTop: '6px' }}>
                  ✓ {receipt.status?.toUpperCase() || 'SUCCESS'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Paystack Reference:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{receipt.reference}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Student Beneficiary:</span>
                  <strong>{receipt.student?.name}</strong>
                </div>
                {receipt.studentBankDetails?.accountNumber && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ color: '#166534', fontWeight: 600 }}>Settlement Bank Account:</span>
                    <span style={{ color: '#15803d', textAlign: 'right', fontWeight: 600 }}>
                      {receipt.studentBankDetails.bankName || 'Bank'} &bull; {receipt.studentBankDetails.accountNumber}
                      {receipt.studentBankDetails.accountName ? ` (${receipt.studentBankDetails.accountName})` : ''}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Sponsor / Foundation:</span>
                  <strong>{receipt.sponsor?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Scholarship Title:</span>
                  <span style={{ maxWidth: '240px', textAlign: 'right', fontWeight: 500 }}>{receipt.sponsorship?.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Payment Channel:</span>
                  <span style={{ textTransform: 'capitalize' }}>{receipt.channel || 'Card'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-ink-soft)' }}>Date Settled:</span>
                  <span>{new Date(receipt.paidAt || receipt.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="secondary-button"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="primary-button"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

