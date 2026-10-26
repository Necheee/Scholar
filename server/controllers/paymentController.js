import prisma from '../config/db.js';
import { parseDurationToDays } from '../utils/durationHelper.js';
import { createNotification } from '../services/notificationService.js';
import { logActivity } from '../services/activityService.js';

// Helper to format payment records for frontend compatibility
export const formatPayment = (p) => {
  if (!p) return null;
  let meta = p.metadata;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = {};
    }
  }
  return {
    ...p,
    _id: p.id,
    sponsor: p.sponsor ? { ...p.sponsor, _id: p.sponsor.id } : p.sponsorId,
    student: p.student ? { ...p.student, _id: p.student.id } : p.studentId,
    sponsorship: p.sponsorship ? { ...p.sponsorship, _id: p.sponsorship.id } : p.sponsorshipId,
    application: p.application ? { ...p.application, _id: p.application.id } : p.applicationId,
    metadata: meta,
  };
};

/**
 * @desc    Initialize a Paystack disbursement transaction for an approved scholarship
 * @route   POST /api/payments/initialize
 * @access  Private (Sponsor only)
 */
export const initializeDisbursement = async (req, res) => {
  try {
    const { applicationId } = req.body;
    const sponsorId = req.user.id || req.user._id;

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        sponsorship: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure the current user is the sponsor of this opportunity
    if (application.sponsorship?.sponsorId !== sponsorId) {
      return res.status(403).json({ message: 'You are not authorized to disburse funds for this opportunity' });
    }

    if (!['Approved', 'Grant Disbursed'].includes(application.status)) {
      return res.status(400).json({
        message: `Application must be in 'Approved' status to disburse funds (current: ${application.status})`,
      });
    }

    const grantAmount = application.sponsorship.grantAmount || 250000;
    const reference = `SCH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLiveKey = paystackSecret && (paystackSecret.startsWith('sk_test_') || paystackSecret.startsWith('sk_live_'));

    if (isLiveKey) {
      const paystackPayload = {
        email: req.user.email,
        amount: Math.round(grantAmount * 100), // amount in kobo
        reference,
        currency: 'NGN',
        callback_url: `${req.headers.origin || 'http://localhost:5173'}/sponsor/applications`,
        metadata: {
          applicationId: application.id,
          sponsorshipId: application.sponsorship.id,
          studentId: application.student.id,
          studentName: application.student.name,
          sponsorshipTitle: application.sponsorship.title,
        },
      };

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paystackPayload),
      });

      const data = await paystackRes.json();

      if (!data.status) {
        return res.status(400).json({
          message: data.message || 'Failed to initialize transaction with Paystack',
        });
      }

      return res.json({
        success: true,
        simulated: false,
        reference,
        amount: grantAmount,
        currency: 'NGN',
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY,
        isLiveMode: (process.env.PAYSTACK_PUBLIC_KEY || '').startsWith('pk_live_'),
        beneficiary: application.student.name,
        opportunity: application.sponsorship.title,
        sponsorEmail: req.user.email,
      });
    } else {
      return res.json({
        success: true,
        simulated: true,
        reference,
        amount: grantAmount,
        currency: 'NGN',
        beneficiary: application.student.name,
        opportunity: application.sponsorship.title,
        sponsorEmail: req.user.email,
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({ message: error.message || 'Server error initializing payment' });
  }
};

/**
 * @desc    Verify Paystack transaction and disburse tuition grant
 * @route   POST /api/payments/verify
 * @access  Private (Sponsor only)
 */
export const verifyDisbursement = async (req, res) => {
  try {
    const { reference, applicationId, simulated } = req.body;
    const sponsorId = req.user.id || req.user._id;

    if (!reference || !applicationId) {
      return res.status(400).json({ message: 'Reference and Application ID are required' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        sponsorship: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.sponsorship?.sponsorId !== sponsorId) {
      return res.status(403).json({ message: 'Unauthorized sponsor action' });
    }

    const grantAmount = application.sponsorship.grantAmount || 250000;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLiveKey = paystackSecret && (paystackSecret.startsWith('sk_test_') || paystackSecret.startsWith('sk_live_'));

    let channel = 'card';
    let paystackTransactionId = `SIM-${reference}`;

    if (!simulated && isLiveKey) {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.status || verifyData.data?.status !== 'success') {
        return res.status(400).json({
          message: verifyData.message || 'Payment verification failed at Paystack',
        });
      }

      channel = verifyData.data.channel || 'card';
      paystackTransactionId = String(verifyData.data.id || reference);
    }

    // Record / Update Payment record in Database
    const payment = await prisma.payment.upsert({
      where: { reference },
      create: {
        reference,
        amount: grantAmount,
        currency: 'NGN',
        status: 'Success',
        paystackTransactionId,
        channel,
        sponsorId,
        studentId: application.student.id,
        sponsorshipId: application.sponsorship.id,
        applicationId: application.id,
        paidAt: new Date(),
        metadata: JSON.stringify({
          simulated: Boolean(simulated || !isLiveKey),
          sponsorshipTitle: application.sponsorship.title,
          studentName: application.student.name,
        }),
      },
      update: {
        status: 'Success',
        paystackTransactionId,
        channel,
        paidAt: new Date(),
        metadata: JSON.stringify({
          simulated: Boolean(simulated || !isLiveKey),
          sponsorshipTitle: application.sponsorship.title,
          studentName: application.student.name,
        }),
      },
    });

    // Update Application Status and Funding Period based on Sponsorship Duration
    const durationDays = parseDurationToDays(application.sponsorship?.duration);
    const disbursedAt = new Date();
    const fundingEndDate = new Date(disbursedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const updatedApp = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: 'Grant Disbursed',
        disbursedAt,
        fundingEndDate,
      },
    });

    // 1. Notify Student
    await createNotification(
      application.student.id,
      'Tuition Grant Disbursed!',
      `Congratulations! Your sponsor has disbursed your scholarship grant of ₦${grantAmount.toLocaleString()} for "${application.sponsorship.title}". (Paystack Ref: ${reference})`,
      application.id
    );

    // 2. Notify Sponsor
    await createNotification(
      sponsorId,
      'Grant Disbursement Confirmed',
      `Tuition grant of ₦${grantAmount.toLocaleString()} successfully disbursed to ${application.student.name}. (Paystack Ref: ${reference})`,
      application.id
    );

    // 3. Log System Activity
    await logActivity(
      'GRANT_DISBURSED',
      `Sponsor ${req.user.name || 'Sponsor'} disbursed ₦${grantAmount.toLocaleString()} grant to ${application.student.name} for "${application.sponsorship.title}". Ref: ${reference}`,
      sponsorId,
      'Sponsor',
      payment.id
    );

    return res.status(200).json({
      success: true,
      message: 'Tuition grant disbursed successfully',
      payment: {
        id: payment.id,
        _id: payment.id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
        channel: payment.channel,
        beneficiary: application.student.name,
        opportunity: application.sponsorship.title,
      },
      applicationStatus: updatedApp.status,
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: error.message || 'Error verifying disbursement' });
  }
};

/**
 * @desc    Get payment receipt for an application
 * @route   GET /api/payments/receipt/:applicationId
 * @access  Private (Sponsor, Student, or Admin)
 */
export const getPaymentReceipt = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const currentUserId = req.user.id || req.user._id;

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { applicationId },
          { id: applicationId },
          { reference: applicationId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sponsor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        sponsorship: {
          select: { id: true, title: true, grantAmount: true, duration: true },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ message: 'No payment record found for this application or reference' });
    }

    const isOwner =
      payment.sponsorId === currentUserId ||
      payment.studentId === currentUserId ||
      req.user.role === 'Admin' ||
      req.user.role === 'Sponsor';

    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this receipt' });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: payment.studentId },
    });

    const bankDetails = studentProfile
      ? {
          bankName: studentProfile.bankName || '',
          accountNumber: studentProfile.accountNumber || '',
          accountName: studentProfile.accountName || '',
        }
      : null;

    const formattedPayment = formatPayment(payment);

    res.json({
      ...formattedPayment,
      studentBankDetails: bankDetails,
    });
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ message: error.message || 'Error fetching receipt' });
  }
};

/**
 * @desc    Get all disbursement transactions / wallet history for the logged-in sponsor
 * @route   GET /api/payments/my-transactions
 * @access  Private (Sponsor only)
 */
export const getSponsorTransactions = async (req, res) => {
  try {
    const sponsorId = req.user.id || req.user._id;

    const payments = await prisma.payment.findMany({
      where: { sponsorId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true, grantAmount: true } },
        application: { select: { id: true, status: true, disbursedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalDisbursed = payments
      .filter((p) => p.status === 'Success')
      .reduce((sum, p) => sum + p.amount, 0);

    const successfulCount = payments.filter((p) => p.status === 'Success').length;

    res.json({
      totalDisbursed,
      transactionCount: payments.length,
      successfulCount,
      transactions: payments.map(formatPayment),
    });
  } catch (error) {
    console.error('Get sponsor transactions error:', error);
    res.status(500).json({ message: error.message || 'Error fetching transaction history' });
  }
};
