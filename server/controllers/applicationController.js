import Application from '../models/Application.js';
import Sponsorship from '../models/Sponsorship.js';
import { runFraudDetection } from '../services/fraudDetectionService.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Submit a new application
// @route   POST /api/applications
// @access  Private/Student
export const submitApplication = async (req, res, next) => {
  try {
    const { sponsorshipId, academicInfoSnapshot, reasonForRequesting, documents } = req.body;

    // One Active Application Rule
    const activeApplication = await Application.findOne({
      student: req.user._id,
      status: { $ne: 'Rejected' }
    });

    if (activeApplication) {
      res.status(400);
      throw new Error('You already have an active application process. You cannot submit another.');
    }

    const sponsorship = await Sponsorship.findById(sponsorshipId);
    if (!sponsorship) {
      res.status(404);
      throw new Error('Sponsorship not found');
    }

    if (sponsorship.status === 'Closed') {
      res.status(400);
      throw new Error('This sponsorship opportunity is closed');
    }

    // Create the application (initial status is usually 'Submitted' or 'Under screening')
    const application = await Application.create({
      student: req.user._id,
      sponsorship: sponsorshipId,
      status: 'Under screening', // Temporarily under screening
      academicInfoSnapshot,
      reasonForRequesting,
      documents,
    });

    // Lock the sponsorship
    if (!sponsorship.isLocked) {
      sponsorship.isLocked = true;
      await sponsorship.save();
    }

    // Run Fraud Detection Engine asynchronously
    // In a real production system, this would be pushed to a queue (e.g. RabbitMQ / Redis)
    // For this project, we await it directly or let it run in background
    const evaluatedApp = await runFraudDetection(application._id);

    res.status(201).json(evaluatedApp || application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's applications
// @route   GET /api/applications/my-applications
// @access  Private/Student
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('sponsorship', 'title sponsor applicationDeadline');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email')
      .populate('sponsorship', 'title sponsor');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Authorization checks
    const isStudent = req.user._id.toString() === application.student._id.toString();
    const isSponsor = req.user.role === 'Sponsor' && req.user._id.toString() === application.sponsorship.sponsor.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isStudent && !isSponsor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this application');
    }

    // Sponsors should only see applications that are 'Under Sponsor review' or higher
    if (isSponsor && !['Under Sponsor review', 'Approved', 'Rejected'].includes(application.status)) {
       res.status(403);
       throw new Error('Application is not yet ready for sponsor review');
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flagged applications for Admin
// @route   GET /api/applications/flagged
// @access  Private/Admin
export const getFlaggedApplications = async (req, res, next) => {
  try {
    // Admin needs applications that are under their review due to flags
    const flaggedApplications = await Application.find({ status: 'Under Admin review', fraudReviewStatus: 'Flagged' })
      .populate('student', 'name')
      .populate('sponsorship', 'title');
      
    // We could also join the FraudResult model here, or have a separate endpoint
    res.json(flaggedApplications);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin review application (Approve, Reject, Request Info)
// @route   PUT /api/applications/:id/admin-review
// @access  Private/Admin
export const adminReviewApplication = async (req, res, next) => {
  try {
    const { action, reason } = req.body; // action: 'approve', 'reject', 'request_info'
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (action === 'approve') {
      application.status = 'Under Sponsor review';
      await createNotification(application.student, 'Application Cleared', `Your application for ${application.sponsorship.title} has passed screening and is now under Sponsor review.`, application._id);
    } else if (action === 'reject') {
      application.status = 'Rejected';
      application.rejectionReason = reason;
      await createNotification(application.student, 'Application Rejected', `Your application for ${application.sponsorship.title} has been rejected by the admin. Reason: ${reason}`, application._id);
    } else if (action === 'request_info') {
      application.status = 'Waiting for additional information';
      await createNotification(application.student, 'Additional Information Required', `The admin has requested more information regarding your application for ${application.sponsorship.title}.`, application._id);
    } else {
      res.status(400);
      throw new Error('Invalid action');
    }

    await application.save();
    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Sponsor review application (Approve, Reject)
// @route   PUT /api/applications/:id/sponsor-review
// @access  Private/Sponsor
export const sponsorReviewApplication = async (req, res, next) => {
  try {
    const { action, reason } = req.body; // action: 'approve', 'reject'
    const application = await Application.findById(req.params.id).populate('sponsorship');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Ensure the sponsor owns the sponsorship
    if (application.sponsorship.sponsor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to review this application');
    }

    if (application.status !== 'Under Sponsor review') {
      res.status(400);
      throw new Error('Application is not ready for your review');
    }

    if (action === 'approve') {
      application.status = 'Approved';
      await createNotification(application.student, 'Application Approved!', `Congratulations! Your application for ${application.sponsorship.title} has been approved by the sponsor.`, application._id);
    } else if (action === 'reject') {
      if (!reason) {
        res.status(400);
        throw new Error('Rejection reason is required');
      }
      application.status = 'Rejected';
      application.rejectionReason = reason;
      await createNotification(application.student, 'Application Rejected', `Unfortunately, your application for ${application.sponsorship.title} was rejected by the sponsor. Reason: ${reason}`, application._id);
    } else {
      res.status(400);
      throw new Error('Invalid action');
    }

    await application.save();
    res.json(application);
  } catch (error) {
    next(error);
  }
};

