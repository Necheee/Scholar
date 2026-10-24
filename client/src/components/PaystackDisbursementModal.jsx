import { useState, useEffect } from 'react'
import api from '../services/api'

export default function PaystackDisbursementModal({ application, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [initData, setInitData] = useState(null)
  const [isPaystackOpen, setIsPaystackOpen] = useState(false)

  const grantAmount = application.sponsorship?.grantAmount || 250000

  useEffect(() => {
    handleInitialize()

    return () => {
      forceClosePaystackIframe()
    }
  }, [application._id])

  function forceClosePaystackIframe() {
    const paystackElements = document.querySelectorAll(
      'iframe[name^="paystack"], iframe[src*="paystack"], .paystack-inline, div[id*="paystack"]'
    )
    paystackElements.forEach((el) => {
      if (el.parentElement && el.parentElement !== document.body) {
        el.parentElement.remove()
      } else {
        el.remove()
      }
    })
    document.body.style.overflow = ''
  }

  async function handleInitialize() {
    try {
      setLoading(true)
      setErrorMsg('')
      const { data } = await api.post('/payments/initialize', {
        applicationId: application._id,
      })
      setInitData(data)
    } catch (err) {
      console.error('Initialization failed:', err)
      setErrorMsg(err.response?.data?.message || 'Failed to initialize Paystack transaction')
    } finally {
      setLoading(false)
    }
  }

  function launchPaystack() {
    if (!initData) return

    if (initData.simulated) {
      // Offline / Local development fallback without keys
      handleVerify(initData.reference, true)
      return
    }

    if (!window.PaystackPop) {
      setErrorMsg('Paystack SDK is still loading. Please check your internet connection and try again.')
      return
    }

    setIsPaystackOpen(true)

    try {
      const handler = window.PaystackPop.setup({
        key: initData.publicKey,
        email: initData.sponsorEmail || 'sponsor@scholar.ng',
        amount: Math.round(initData.amount * 100),
        currency: 'NGN',
        ref: initData.reference,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        metadata: {
          custom_fields: [
            { display_name: 'Beneficiary', variable_name: 'beneficiary', value: initData.beneficiary },
            { display_name: 'Opportunity', variable_name: 'opportunity', value: initData.opportunity },
            { display_name: 'Application ID', variable_name: 'application_id', value: application._id },
          ],
        },
        callback: function (response) {
          forceClosePaystackIframe()
          setIsPaystackOpen(false)
          handleVerify(response.reference || initData.reference, false)
        },
        onClose: function () {
          forceClosePaystackIframe()
          setIsPaystackOpen(false)
        },
      })

      handler.openIframe()
    } catch (err) {
      console.error('Failed to open Paystack iframe:', err)
      setIsPaystackOpen(false)
      setErrorMsg('Failed to launch Paystack gateway. Please try again.')
    }
  }

  async function handleVerify(referenceToVerify, isSimulated = false) {
    try {
      setVerifying(true)
      setErrorMsg('')

      const { data } = await api.post('/payments/verify', {
        reference: referenceToVerify || initData?.reference,
        applicationId: application._id,
        simulated: isSimulated,
      })

      if (onSuccess) {
        onSuccess(application._id, data.payment)
      }
    } catch (err) {
      console.error('Verification failed:', err)
      setErrorMsg(err.response?.data?.message || 'Payment verification failed at Paystack')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <>
      {/* Floating Escape Button (renders above Paystack's iframe so sponsor can cancel/close anytime) */}
      {isPaystackOpen && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 2147483647,
            pointerEvents: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => {
              forceClosePaystackIframe()
              setIsPaystackOpen(false)
              onClose()
            }}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: '2px solid #ffffff',
              padding: '10px 22px',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            ✕ Cancel & Close Paystack
          </button>
        </div>
      )}

      {/* Main Disbursement Modal Popup */}
      {!isPaystackOpen && (
        <div 
          className="modal-backdrop" 
          onClick={onClose}
          style={{ zIndex: 1100 }}
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
            {/* Paystack Themed Header */}
            <div style={{ background: '#092440', color: '#ffffff', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#0ba4db', color: '#ffffff', fontWeight: 800, width: '38px', height: '38px', borderRadius: '8px', display: 'grid', placeItems: 'center', fontSize: '1.25rem' }}>
                  P
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '1.15rem' }}>Paystack Disbursement</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#8fb1d1' }}>Educational Tuition Grant Payment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '28px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🔄 Initializing Paystack...</div>
                  <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem', margin: 0 }}>
                    Preparing secure transaction reference with Paystack API.
                  </p>
                </div>
              ) : verifying ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '8px' }}>⚡ Verifying Transaction...</div>
                  <p style={{ color: 'var(--color-ink-soft)', fontSize: '0.9rem', margin: 0 }}>
                    Confirming settlement with Paystack and logging student voucher.
                  </p>
                </div>
              ) : errorMsg ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'grid', placeItems: 'center', margin: '0 auto 12px', fontSize: '1.5rem' }}>
                    ✕
                  </div>
                  <h4 style={{ margin: '0 0 8px', color: '#991b1b' }}>Payment Notice</h4>
                  <p style={{ fontSize: '0.88rem', color: '#b91c1c', marginBottom: '20px' }}>
                    {errorMsg}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      className="secondary-button"
                      style={{ flex: 1, padding: '10px' }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleInitialize}
                      className="primary-button"
                      style={{ flex: 1, padding: '10px' }}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : initData ? (
                <div>
                  {/* Amount Overview */}
                  <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      Tuition Grant Disbursement
                    </div>
                    <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#166534' }}>
                      ₦{initData.amount?.toLocaleString()}
                    </div>
                    <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, marginTop: '8px' }}>
                      {initData.simulated ? 'Demo Simulation Mode' : '🟢 Paystack Test Mode (Multi-Channel)'}
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-soft)' }}>Student Beneficiary:</span>
                      <strong>{initData.beneficiary || application.student?.name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-soft)' }}>Scholarship Program:</span>
                      <span style={{ maxWidth: '240px', textAlign: 'right', fontWeight: 500 }}>{initData.opportunity || application.sponsorship?.title}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-ink-soft)' }}>Transaction Reference:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{initData.reference}</strong>
                    </div>
                  </div>

                  {/* Supported Payment Channels */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Supported Payment Channels in Paystack:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>💳</span> <strong>Cards</strong> (Visa, Verve, MC)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🏦</span> <strong>Bank Transfer</strong> (Instant)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📱</span> <strong>USSD</strong> (*737#, etc.)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🏛️</span> <strong>Bank Account</strong>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      className="secondary-button"
                      style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={launchPaystack}
                      className="primary-button"
                      style={{ flex: 1.6, padding: '12px', borderRadius: '8px', fontWeight: 700, background: '#0ba4db', borderColor: '#0ba4db', color: '#ffffff' }}
                    >
                      🚀 Open Paystack Checkout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
