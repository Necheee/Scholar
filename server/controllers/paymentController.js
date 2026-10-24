import Payment from '../models/Payment.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { parseDurationToDays } from '../utils/durationHelper.js';

/**
 * @desc    Initialize a Paystack disbursement transaction for an approved scholarship
 * @route   POST /api/payments/initialize
 * @access  Private (Sponsor only)
 */
export const initializeDisbursement = async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID is required' });
    }

    const application = await Application.findById(applicationId)
      .populate('sponsorship')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure the current user is the sponsor of this opportunity
    if (application.sponsorship.sponsor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to disburse funds for this opportunity' });
    }

    if (!['Approved', 'Grant Disbursed'].includes(application.status)) {
      return res.status(400).json({ 
        message: `Application must be in 'Approved' status to disburse funds (current: ${application.status})` 
      });
    }

    const grantAmount = application.sponsorship.grantAmount || 250000;
    const reference = `SCH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLiveKey = paystackSecret && (paystackSecret.startsWith('sk_test_') || paystackSecret.startsWith('sk_live_'));

    if (isLiveKey) {
      // Live Paystack API initialization
      const paystackPayload = {
        email: req.user.email,
        amount: Math.round(grantAmount * 100), // amount in kobo
        reference,
        currency: 'NGN',
        callback_url: `${req.headers.origin || 'http://localhost:5173'}/sponsor/applications`,
        metadata: {
          applicationId: application._id.toString(),
          sponsorshipId: application.sponsorship._id.toString(),
          studentId: application.student._id.toString(),
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
          message: data.message || 'Failed to initialize transaction with Paystack' 
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
        beneficiary: application.student.name,
        opportunity: application.sponsorship.title,
        sponsorEmail: req.user.email,
      });
    } else {
      // Simulated / Local demonstration fallback when live keys have not been configured yet
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

    if (!reference || !applicationId) {
      return res.status(400).json({ message: 'Reference and Application ID are required' });
    }

    const application = await Application.findById(applicationId)
      .populate('sponsorship')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.sponsorship.sponsor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized sponsor action' });
    }

    const grantAmount = application.sponsorship.grantAmount || 250000;
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const isLiveKey = paystackSecret && (paystackSecret.startsWith('sk_test_') || paystackSecret.startsWith('sk_live_'));

    let channel = 'card';
    let paystackTransactionId = `SIM-${reference}`;

    if (!simulated && isLiveKey) {
      // Verify directly with upstream Paystack API
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
    const payment = await Payment.findOneAndUpdate(
      { reference },
      {
        reference,
        amount: grantAmount,
        currency: 'NGN',
        status: 'Success',
        paystackTransactionId,
        channel,
        sponsor: req.user._id,
        student: application.student._id,
        sponsorship: application.sponsorship._id,
        application: application._id,
        paidAt: new Date(),
        metadata: {
          simulated: Boolean(simulated || !isLiveKey),
          sponsorshipTitle: application.sponsorship.title,
          studentName: application.student.name,
        },
      },
      { upsert: true, new: true }
    );

    // Update Application Status and Funding Period based on Sponsorship Duration
    const durationDays = parseDurationToDays(application.sponsorship?.duration);
    const disbursedAt = new Date();
    const fundingEndDate = new Date(disbursedAt.getTime() + durationDays * 24 * 60 * 60 * 1000);

    application.status = 'Grant Disbursed';
    application.disbursedAt = disbursedAt;
    application.fundingEndDate = fundingEndDate;
    await application.save();

    // 1. Notify Student
    await Notification.create({
      user: application.student._id,
      title: 'Tuition Grant Disbursed!',
      message: `Congratulations! Your sponsor has disbursed your scholarship grant of ₦${grantAmount.toLocaleString()} for "${application.sponsorship.title}". (Paystack Ref: ${reference})`,
      relatedApplication: application._id,
    });

    // 2. Notify Sponsor
    await Notification.create({
      user: req.user._id,
      title: 'Grant Disbursement Confirmed',
      message: `Tuition grant of ₦${grantAmount.toLocaleString()} successfully disbursed to ${application.student.name}. (Paystack Ref: ${reference})`,
      relatedApplication: application._id,
    });

    // 3. Log System Activity for Admin Audit Trail
    await ActivityLog.create({
      action: 'GRANT_DISBURSED',
      description: `Sponsor ${req.user.name || 'Sponsor'} disbursed ₦${grantAmount.toLocaleString()} grant to ${application.student.name} for "${application.sponsorship.title}". Ref: ${reference}`,
      user: req.user._id,
      role: 'Sponsor',
      relatedId: payment._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Tuition grant disbursed successfully',
      payment: {
        id: payment._id,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paidAt: payment.paidAt,
        channel: payment.channel,
        beneficiary: application.student.name,
        opportunity: application.sponsorship.title,
      },
      applicationStatus: application.status,
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

    const payment = await Payment.findOne({ application: applicationId })
      .populate('sponsor', 'name email')
      .populate('student', 'name email')
      .populate('sponsorship', 'title grantAmount duration');

    if (!payment) {
      return res.status(404).json({ message: 'No payment record found for this application' });
    }

    // Ensure only involved parties or Admin can access
    const userId = req.user._id.toString();
    const isOwner = 
      (payment.sponsor?._id ? payment.sponsor._id.toString() === userId : false) || 
      (payment.student?._id ? payment.student._id.toString() === userId : false) || 
      req.user.role === 'Admin';

    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this receipt' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ message: error.message || 'Error fetching receipt' });
  }
};

/**
 * @desc    Get all disbursement transactions / wallet history for the logged-in sponsor
 * @route   GET /api/payments/my-transactions
 * @access  Private (Sponsor only) - Satisfies Chapter 3.4.2 & 3.4.5 Wallet/Transaction
 */
export const getSponsorTransactions = async (req, res) => {
  try {
    const payments = await Payment.find({ sponsor: req.user._id })
      .populate('student', 'name email')
      .populate('sponsorship', 'title grantAmount')
      .populate('application', 'status disbursedAt')
      .sort({ createdAt: -1 });

    const totalDisbursed = payments
      .filter((p) => p.status === 'Success')
      .reduce((sum, p) => sum + p.amount, 0);

    const successfulCount = payments.filter((p) => p.status === 'Success').length;

    res.json({
      totalDisbursed,
      transactionCount: payments.length,
      successfulCount,
      transactions: payments,
    });
  } catch (error) {
    console.error('Get sponsor transactions error:', error);
    res.status(500).json({ message: error.message || 'Error fetching transaction history' });
  }
};

