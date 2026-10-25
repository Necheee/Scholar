import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import api from '../services/api'

export default function PaymentReceiptModal({ applicationId, onClose }) {
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const resolvedId = typeof applicationId === 'object'
    ? (applicationId?._id || applicationId?.id || applicationId?.application)
    : applicationId

  // Lock body scroll while modal is active and support ESC key
  useEffect(() => {
    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    if (!resolvedId) return

    async function fetchReceipt() {
      try {
        setLoading(true)
        setError('')
        const { data } = await api.get(`/payments/receipt/${resolvedId}`)
        setReceipt(data)
      } catch (err) {
        console.error('Failed to load receipt:', err)
        setError(err.response?.data?.message || 'Failed to load transaction receipt')
      } finally {
        setLoading(false)
      }
    }
    fetchReceipt()
  }, [resolvedId])

  // Dedicated isolated print function (ensures ONLY the receipt voucher is printed)
  const handlePrint = (e) => {
    if (e) e.stopPropagation()

    const printableElement = document.getElementById('receipt-modal-printable')
    if (!printableElement) {
      window.print()
      return
    }

    try {
      const existingFrame = document.getElementById('receipt-hidden-print-frame')
      if (existingFrame) {
        existingFrame.remove()
      }

      const printFrame = document.createElement('iframe')
      printFrame.id = 'receipt-hidden-print-frame'
      printFrame.style.position = 'fixed'
      printFrame.style.right = '0'
      printFrame.style.bottom = '0'
      printFrame.style.width = '0'
      printFrame.style.height = '0'
      printFrame.style.border = '0'
      document.body.appendChild(printFrame)

      const doc = printFrame.contentWindow.document
      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Disbursement Receipt - ${receipt?.reference || 'Scholar'}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                background: #ffffff;
                color: #0f172a;
                padding: 24px;
                display: flex;
                justify-content: center;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .receipt-print-wrapper {
                width: 100%;
                max-width: 540px;
                border: 2px solid #092440;
                border-radius: 12px;
                overflow: hidden;
                background: #ffffff;
              }
              .receipt-no-print {
                display: none !important;
              }
              @page {
                size: auto;
                margin: 15mm;
              }
            </style>
          </head>
          <body>
            <div class="receipt-print-wrapper">
              ${printableElement.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
              };
            </script>
          </body>
        </html>
      `)
      doc.close()

      setTimeout(() => {
        try {
          printFrame.contentWindow.focus()
          printFrame.contentWindow.print()
        } catch {
          window.print()
        }
        setTimeout(() => {
          if (printFrame && printFrame.parentNode) {
            printFrame.parentNode.removeChild(printFrame)
          }
        }, 3000)
      }, 350)
    } catch {
      window.print()
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div 
      className="receipt-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        id="receipt-modal-printable"
        className="receipt-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Receipt Header Banner */}
        <div style={{ background: '#092440', color: '#ffffff', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0ba4db', color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '1.3rem', fontWeight: 800 }}>
              S
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.2rem', letterSpacing: '-0.01em', fontWeight: 700 }}>
                Scholar Disbursement Receipt
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#8fb1d1' }}>
                Official Paystack Settlement Record
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="receipt-no-print"
            aria-label="Close receipt"
            style={{ 
              background: 'rgba(255, 255, 255, 0.12)', 
              border: 'none', 
              color: '#ffffff', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              cursor: 'pointer', 
              fontSize: '1.2rem', 
              display: 'grid', 
              placeItems: 'center',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Receipt Content Body */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-ink-soft)' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>🔄</div>
              <p style={{ margin: 0, fontWeight: 500 }}>Retrieving official transaction record...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '36px 24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontSize: '1.5rem' }}>✕</div>
              <h4 style={{ margin: '0 0 8px', color: '#991b1b' }}>Receipt Unavailable</h4>
              <p style={{ margin: '0 0 20px', color: '#b91c1c', fontSize: '0.9rem' }}>{error}</p>
              <button 
                type="button" 
                onClick={onClose} 
                className="primary-button receipt-no-print" 
                style={{ padding: '8px 24px' }}
              >
                Close
              </button>
            </div>
          ) : receipt ? (
            <div>
              {/* Highlight Amount Banner */}
              <div style={{ textAlign: 'center', padding: '24px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '6px' }}>
                  Educational Tuition Grant Disbursed
                </div>
                <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#166534', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  ₦{receipt.amount?.toLocaleString()}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '4px 14px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px', border: '1px solid #bbf7d0' }}>
                  <span>✓</span> {receipt.status?.toUpperCase() || 'SETTLEMENT SUCCESSFUL'}
                </div>
              </div>

              {/* Transaction Key Details */}
              <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Paystack Reference:</span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '0.92rem', color: '#0f172a' }}>{receipt.reference}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Student Beneficiary:</span>
                    <strong style={{ color: '#0f172a' }}>{receipt.student?.name}</strong>
                  </div>

                  {receipt.studentBankDetails?.accountNumber && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#166534', fontWeight: 700, display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Settlement Bank Account
                        </span>
                        <span style={{ color: '#15803d', fontSize: '0.9rem', fontWeight: 600 }}>
                          {receipt.studentBankDetails.bankName || 'Bank'} &bull; {receipt.studentBankDetails.accountNumber}
                        </span>
                      </div>
                      {receipt.studentBankDetails.accountName && (
                        <span style={{ fontSize: '0.78rem', color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {receipt.studentBankDetails.accountName}
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Sponsor / Benefactor:</span>
                    <strong style={{ color: '#0f172a' }}>{receipt.sponsor?.name}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Scholarship Title:</span>
                    <span style={{ maxWidth: '260px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      {receipt.sponsorship?.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Payment Channel:</span>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#0f172a' }}>
                      {receipt.channel || 'Paystack Direct Gateway'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Date Settled:</span>
                    <span style={{ color: '#0f172a', fontWeight: 500 }}>
                      {new Date(receipt.paidAt || receipt.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>

                {/* Authenticated Verification Footnote */}
                <div style={{ marginTop: '18px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '0.78rem', color: '#64748b', textAlign: 'center', lineHeight: 1.45 }}>
                  <div>🔒 <strong>Authenticated Digital Transaction</strong></div>
                  <div>Verified by Paystack Gateway &bull; Scholar Automated Audit System</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    This is a computer-generated voucher. No physical signature is required.
                  </div>
                </div>

                {/* Modal Action Buttons (Cleanly excluded during print) */}
                <div className="receipt-no-print" style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="secondary-button"
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      borderRadius: '10px', 
                      fontWeight: 700, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    🖨️ Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="primary-button"
                    style={{ 
                      flex: 1, 
                      padding: '12px', 
                      borderRadius: '10px', 
                      fontWeight: 700, 
                      cursor: 'pointer' 
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  )
}
