import prisma from '../config/db.js';
import { runFraudDetection } from '../services/fraudDetectionService.js';
import { createNotification } from '../services/notificationService.js';
import { logActivity } from '../services/activityService.js';
import { getFundingStatus } from '../utils/durationHelper.js';

// Helper to format application object for 100% frontend compatibility
export const formatApplication = (app) => {
  if (!app) return null;

  let fraudResult = null;
  if (app.fraudResult) {
    let rules = app.fraudResult.rulesTriggered;
    if (typeof rules === 'string') {
      try {
        rules = JSON.parse(rules);
      } catch {
        rules = [];
      }
    }
    fraudResult = {
      ...app.fraudResult,
      _id: app.fraudResult.id,
      rulesTriggered: Array.isArray(rules) ? rules : [],
    };
  }

  const docs = (app.documents || []).map((d) => ({
    ...d,
    _id: d.id,
  }));

  const sponsorshipObj = app.sponsorship
    ? {
        ...app.sponsorship,
        _id: app.sponsorship.id,
        sponsor: app.sponsorship.sponsorId,
      }
    : app.sponsorshipId;

  return {
    ...app,
    _id: app.id,
    student: app.student ? { ...app.student, _id: app.student.id } : app.studentId,
    sponsorship: sponsorshipObj,
    academicInfoSnapshot: {
      session: app.academicSession || '',
      level: app.academicLevel || '',
      programme: app.academicProgramme || '',
    },
    documents: docs,
    fraudResult,
  };
};

// @desc    Submit a new application
// @route   POST /api/applications
// @access  Private/Student
export const submitApplication = async (req, res, next) => {
  try {
    const { sponsorshipId, academicInfoSnapshot, reasonForRequesting, documents } = req.body;
    const studentId = req.user.id || req.user._id;

    // 1. One Active In-Review Application Rule
    const activeReviewApp = await prisma.application.findFirst({
      where: {
        studentId,
        status: {
          in: [
            'Draft',
            'Submitted',
            'Under screening',
            'Under Admin review',
            'Waiting for additional information',
            'Under Sponsor review',
          ],
        },
      },
      include: {
        sponsorship: { select: { title: true } },
      },
    });

    if (activeReviewApp) {
      res.status(400);
      throw new Error(
        `You already have an active application under review for "${activeReviewApp.sponsorship?.title || 'an opportunity'}". You cannot submit another application until a decision is reached.`
      );
    }

    // 2. Duration-based Active Scholarship Rule
    const fundedApps = await prisma.application.findMany({
      where: {
        studentId,
        status: { in: ['Grant Disbursed', 'Approved'] },
      },
      include: {
        sponsorship: { select: { title: true, duration: true } },
      },
    });

    for (const fundedApp of fundedApps) {
      const funding = getFundingStatus(fundedApp);
      if (funding.isFundedActive) {
        res.status(400);
        const daysText = `${funding.daysRemaining} day${funding.daysRemaining === 1 ? '' : 's'}`;
        throw new Error(
          `You are currently receiving funding under "${fundedApp.sponsorship?.title}" (${fundedApp.sponsorship?.duration || '1 Academic Session'}). Your grant period concludes on ${funding.endDate.toLocaleDateString()} (${daysText} remaining). You will be eligible to apply for another scholarship once this funded period concludes.`
        );
      }
    }

    const sponsorship = await prisma.sponsorship.findUnique({
      where: { id: sponsorshipId },
    });
    if (!sponsorship) {
      res.status(404);
      throw new Error('Sponsorship not found');
    }

    if (sponsorship.status === 'Closed') {
      res.status(400);
      throw new Error('This sponsorship opportunity is closed');
    }

    // Create the application with documents in a transaction
    const application = await prisma.$transaction(async (tx) => {
      const createdApp = await tx.application.create({
        data: {
          studentId,
          sponsorshipId,
          status: 'Under screening',
          academicSession: academicInfoSnapshot?.session || null,
          academicLevel: academicInfoSnapshot?.level || null,
          academicProgramme: academicInfoSnapshot?.programme || null,
          reasonForRequesting: reasonForRequesting || null,
        },
      });

      if (documents && Array.isArray(documents) && documents.length > 0) {
        await tx.applicationDocument.createMany({
          data: documents.map((doc) => ({
            applicationId: createdApp.id,
            type: doc.type,
            cloudinaryUrl: doc.cloudinaryUrl,
            cloudinaryId: doc.cloudinaryId,
            fileHash: doc.fileHash || null,
          })),
        });
      }

      if (!sponsorship.isLocked) {
        await tx.sponsorship.update({
          where: { id: sponsorship.id },
          data: { isLocked: true },
        });
      }

      return createdApp;
    });

    // Run Fraud Detection Engine
    const evaluatedApp = await runFraudDetection(application.id);

    await logActivity(
      'Application Submitted',
      `Student applied for sponsorship "${sponsorship.title}".`,
      studentId,
      'Student',
      application.id
    );

    const fullApp = await prisma.application.findUnique({
      where: { id: application.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: true,
        documents: true,
        fraudResult: true,
      },
    });

    res.status(201).json(formatApplication(fullApp || evaluatedApp));
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's applications
// @route   GET /api/applications/my-applications
// @access  Private/Student
export const getMyApplications = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;
    const applications = await prisma.application.findMany({
      where: { studentId },
      include: {
        sponsorship: {
          select: {
            id: true,
            title: true,
            sponsorId: true,
            applicationDeadline: true,
            grantAmount: true,
            duration: true,
          },
        },
        documents: true,
        fraudResult: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const appsWithFunding = applications.map((app) => {
      const formatted = formatApplication(app);
      return {
        ...formatted,
        fundingStatus: getFundingStatus(app),
      };
    });

    res.json(appsWithFunding);
  } catch (error) {
    next(error);
  }
};

// @desc    Get applications for a sponsor's sponsorships
// @route   GET /api/applications/sponsor-applications
// @access  Private/Sponsor
export const getSponsorApplications = async (req, res, next) => {
  try {
    const sponsorId = req.user.id || req.user._id;

    // Find all sponsorships owned by this sponsor
    const sponsorships = await prisma.sponsorship.findMany({
      where: { sponsorId },
      select: { id: true },
    });
    const sponsorshipIds = sponsorships.map((s) => s.id);

    const applications = await prisma.application.findMany({
      where: {
        sponsorshipId: { in: sponsorshipIds },
        status: {
          in: [
            'Under Sponsor review',
            'Approved',
            'Grant Disbursed',
            'Waiting for additional information',
            'Rejected',
          ],
        },
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: {
          select: {
            id: true,
            title: true,
            grantAmount: true,
            duration: true,
            applicationDeadline: true,
          },
        },
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications.map(formatApplication));
  } catch (error) {
    next(error);
  }
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: {
          select: {
            id: true,
            title: true,
            sponsorId: true,
            grantAmount: true,
            duration: true,
            applicationDeadline: true,
          },
        },
        documents: true,
        fraudResult: true,
      },
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const currentUserId = req.user.id || req.user._id;
    const isStudent = currentUserId === application.studentId;
    const isSponsor = req.user.role === 'Sponsor' && currentUserId === application.sponsorship?.sponsorId;
    const isAdmin = req.user.role === 'Admin';

    if (!isStudent && !isSponsor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this application');
    }

    if (
      isSponsor &&
      !['Under Sponsor review', 'Approved', 'Grant Disbursed', 'Waiting for additional information', 'Rejected'].includes(
        application.status
      )
    ) {
      res.status(403);
      throw new Error('Application is not yet ready for sponsor review');
    }

    res.json(formatApplication(application));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all flagged applications for Admin
// @route   GET /api/applications/flagged
// @access  Private/Admin
export const getFlaggedApplications = async (req, res, next) => {
  try {
    const flaggedApplications = await prisma.application.findMany({
      where: {
        status: 'Under Admin review',
        fraudReviewStatus: 'Flagged',
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: { select: { id: true, title: true } },
        documents: true,
        fraudResult: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(flaggedApplications.map(formatApplication));
  } catch (error) {
    next(error);
  }
};

// @desc    Admin review application (Approve, Reject, Request Info)
// @route   PUT /api/applications/:id/admin-review
// @access  Private/Admin
export const adminReviewApplication = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        sponsorship: true,
      },
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.status !== 'Under Admin review') {
      res.status(409);
      throw new Error(
        `State Conflict: This application is currently '${application.status}' and cannot be reviewed by an Admin right now. Please refresh the page.`
      );
    }

    let newStatus = application.status;
    let newRejectionReason = application.rejectionReason;

    if (action === 'approve') {
      newStatus = 'Under Sponsor review';
      await createNotification(
        application.studentId,
        'Application Cleared',
        `Your application for ${application.sponsorship?.title} has passed screening and is now under Sponsor review.`,
        application.id
      );

      if (application.sponsorship && application.sponsorship.sponsorId) {
        await createNotification(
          application.sponsorship.sponsorId,
          'New Application Received',
          `An application for ${application.sponsorship.title} has passed Admin screening and is ready for your review.`,
          application.id
        );
      }
    } else if (action === 'reject') {
      newStatus = 'Rejected';
      newRejectionReason = reason;
      await createNotification(
        application.studentId,
        'Application Rejected',
        `Your application for ${application.sponsorship?.title} has been rejected by the admin. Reason: ${reason}`,
        application.id
      );
    } else if (action === 'request_info') {
      newStatus = 'Waiting for additional information';
      await createNotification(
        application.studentId,
        'Additional Information Required',
        `The admin has requested more information regarding your application for ${application.sponsorship?.title}.`,
        application.id
      );
    } else {
      res.status(400);
      throw new Error('Invalid action');
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: newStatus,
        rejectionReason: newRejectionReason,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: true,
        documents: true,
        fraudResult: true,
      },
    });

    await logActivity(
      'Admin Reviewed Application',
      'Admin made a decision on a flagged application.',
      req.user.id || req.user._id,
      'Admin',
      application.id
    );

    res.json(formatApplication(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Sponsor review application (Approve, Reject)
// @route   PUT /api/applications/:id/sponsor-review
// @access  Private/Sponsor
export const sponsorReviewApplication = async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        sponsorship: true,
      },
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const currentUserId = req.user.id || req.user._id;
    if (application.sponsorship?.sponsorId !== currentUserId) {
      res.status(403);
      throw new Error('Not authorized to review this application');
    }

    if (application.status !== 'Under Sponsor review') {
      res.status(409);
      throw new Error(
        `State Conflict: This application is currently '${application.status}' and cannot be reviewed by a Sponsor right now. Please refresh the page.`
      );
    }

    let newStatus = application.status;
    let newRejectionReason = application.rejectionReason;
    let newReasonForRequesting = application.reasonForRequesting;

    if (action === 'approve') {
      newStatus = 'Approved';
      await createNotification(
        application.studentId,
        'Application Approved!',
        `Congratulations! Your application for ${application.sponsorship?.title} has been approved by the sponsor.`,
        application.id
      );
    } else if (action === 'reject') {
      if (!reason) {
        res.status(400);
        throw new Error('Rejection reason is required');
      }
      newStatus = 'Rejected';
      newRejectionReason = reason;
      await createNotification(
        application.studentId,
        'Application Rejected',
        `Unfortunately, your application for ${application.sponsorship?.title} was rejected by the sponsor. Reason: ${reason}`,
        application.id
      );
    } else if (action === 'request_info') {
      if (!reason) {
        res.status(400);
        throw new Error('Reason for requesting information is required');
      }
      newStatus = 'Waiting for additional information';
      newReasonForRequesting = reason;
      await createNotification(
        application.studentId,
        'Information Requested',
        `The Sponsor has requested additional information for your application: ${reason}`,
        application.id
      );
    } else {
      res.status(400);
      throw new Error('Invalid action');
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: newStatus,
        rejectionReason: newRejectionReason,
        reasonForRequesting: newReasonForRequesting,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: true,
        documents: true,
        fraudResult: true,
      },
    });

    await logActivity(
      'Sponsor Reviewed Application',
      'Sponsor made a decision on an application.',
      currentUserId,
      'Sponsor',
      application.id
    );

    res.json(formatApplication(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Provide requested additional information
// @route   PUT /api/applications/:id/provide-info
// @access  Private/Student
export const provideAdditionalInformation = async (req, res, next) => {
  try {
    const { documents } = req.body;
    const studentId = req.user.id || req.user._id;

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { sponsorship: true, documents: true },
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.studentId !== studentId) {
      res.status(403);
      throw new Error('Not authorized to update this application');
    }

    if (application.status !== 'Waiting for additional information') {
      res.status(400);
      throw new Error('Application is not currently waiting for information');
    }

    if (!documents || documents.length === 0) {
      res.status(400);
      throw new Error('Please provide the requested documents');
    }

    // Append new documents
    await prisma.applicationDocument.createMany({
      data: documents.map((doc) => ({
        applicationId: application.id,
        type: doc.type,
        cloudinaryUrl: doc.cloudinaryUrl,
        cloudinaryId: doc.cloudinaryId,
        fileHash: doc.fileHash || null,
      })),
    });

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: {
        status: 'Under Admin review',
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: true,
        documents: true,
        fraudResult: true,
      },
    });

    if (application.sponsorship && application.sponsorship.sponsorId) {
      await createNotification(
        application.sponsorship.sponsorId,
        'Information Provided',
        `The student has provided the requested information for their ${application.sponsorship.title} application.`,
        application.id
      );
    }

    res.json(formatApplication(updated));
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   PUT /api/applications/:id/withdraw
// @access  Private/Student
export const withdrawApplication = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
    });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    if (application.studentId !== studentId) {
      res.status(403);
      throw new Error('Not authorized to withdraw this application');
    }

    if (['Approved', 'Rejected', 'Withdrawn'].includes(application.status)) {
      res.status(400);
      throw new Error(`Cannot withdraw an application that is already ${application.status}`);
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: 'Withdrawn' },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: true,
        documents: true,
        fraudResult: true,
      },
    });

    // Unlock sponsorship if no other active applications remain
    if (application.sponsorshipId) {
      const otherActiveApps = await prisma.application.count({
        where: {
          sponsorshipId: application.sponsorshipId,
          id: { not: application.id },
          status: { notIn: ['Rejected', 'Withdrawn'] },
        },
      });

      if (otherActiveApps === 0) {
        await prisma.sponsorship.update({
          where: { id: application.sponsorshipId },
          data: { isLocked: false },
        });
      }
    }

    await logActivity(
      'Application Withdrawn',
      'Student withdrew their application.',
      studentId,
      'Student',
      application.id
    );

    res.json(formatApplication(updated));
  } catch (error) {
    next(error);
  }
};
