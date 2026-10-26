import prisma from '../config/db.js';
import { createNotification } from './notificationService.js';

// --- FRAUD RULES ---

const checkAcademicInconsistency = async (application, studentProfile) => {
  if (!application.academicProgramme || !studentProfile || !studentProfile.academicRecords || studentProfile.academicRecords.length === 0) {
    return null;
  }

  const latestRecord = studentProfile.academicRecords[studentProfile.academicRecords.length - 1];
  const appProg = application.academicProgramme || '';
  const appLevel = application.academicLevel || '';

  if (
    latestRecord.programme.toLowerCase().trim() !== appProg.toLowerCase().trim() ||
    latestRecord.level !== appLevel
  ) {
    return {
      ruleName: 'Academic Record Inconsistency',
      severity: 'Medium',
      evidence: `Application states programme '${appProg}' at level '${appLevel}', but profile states '${latestRecord.programme}' at level '${latestRecord.level}'.`,
    };
  }

  return null;
};

const checkDuplicateApplications = async (application) => {
  const previousApps = await prisma.application.findMany({
    where: {
      studentId: application.studentId,
      id: { not: application.id },
      status: { in: ['Rejected', 'Approved', 'Grant Disbursed'] },
    },
  });

  for (const prev of previousApps) {
    if (prev.reasonForRequesting && application.reasonForRequesting) {
      if (prev.reasonForRequesting.trim() === application.reasonForRequesting.trim()) {
        return {
          ruleName: 'Recycled Application Material',
          severity: 'Low',
          evidence: `The 'Reason for Requesting Sponsorship' exactly matches a previous application (${prev.id}).`,
        };
      }
    }
  }

  return null;
};

// Rule: Reused Document Cryptographic SHA-256 Hash Matching
const checkReusedDocuments = async (application) => {
  if (!application.documents || application.documents.length === 0) {
    return null;
  }

  const hashes = application.documents
    .map((doc) => doc.fileHash)
    .filter(Boolean);

  if (hashes.length === 0) {
    return null;
  }

  // Cross-reference against documents submitted by other students
  const match = await prisma.applicationDocument.findFirst({
    where: {
      fileHash: { in: hashes },
      applicationId: { not: application.id },
      application: {
        studentId: { not: application.studentId },
      },
    },
    include: {
      application: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (match) {
    return {
      ruleName: 'Reused Document (Cross-Applicant Identity / Credential Sharing)',
      severity: 'High',
      evidence: `A submitted document (${match.type || 'Credential'}) shares an identical cryptographic SHA-256 hash with a file previously submitted by another applicant (${match.application?.student?.email || 'Applicant ID ' + match.application?.studentId}).`,
    };
  }

  return null;
};

// Rule: Multiple Accounts Detection
const checkMultipleAccounts = async (application, studentProfile) => {
  if (!studentProfile || !studentProfile.institution || !studentProfile.department) {
    return null;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: application.studentId },
  });
  if (!currentUser) return null;

  const otherProfiles = await prisma.studentProfile.findMany({
    where: {
      userId: { not: currentUser.id },
      institution: studentProfile.institution.trim(),
      department: studentProfile.department.trim(),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  for (const other of otherProfiles) {
    if (!other.user) continue;

    const currentName = currentUser.name.toLowerCase().replace(/[^a-z]/g, '');
    const otherName = other.user.name.toLowerCase().replace(/[^a-z]/g, '');

    if (currentName.length > 3 && currentName === otherName) {
      return {
        ruleName: 'Multiple Accounts (Identity Duplication)',
        severity: 'High',
        evidence: `Student identity '${currentUser.name}' matches another registered account (${other.user.email}) in department '${studentProfile.department}'. Students cannot operate multiple accounts to apply for aid.`,
      };
    }
  }

  return null;
};

// Rule: Conflicting Financial Information
const checkConflictingFinancialInfo = async (application) => {
  const activeFundedApp = await prisma.application.findFirst({
    where: {
      studentId: application.studentId,
      id: { not: application.id },
      status: { in: ['Grant Disbursed', 'Approved'] },
    },
    include: {
      sponsorship: true,
    },
  });

  if (activeFundedApp) {
    const isStillActive = !activeFundedApp.fundingEndDate || new Date(activeFundedApp.fundingEndDate) > new Date();

    if (isStillActive) {
      const reasonText = (application.reasonForRequesting || '').toLowerCase();
      const claimsZeroAid = /no financial (aid|support|assistance)|zero (aid|support|funding)|never received (any|a) (scholarship|grant|sponsorship)|no other source of funding/i.test(reasonText);

      return {
        ruleName: 'Conflicting Financial Information',
        severity: claimsZeroAid ? 'High' : 'Medium',
        evidence: `Applicant currently holds an active funded grant under "${activeFundedApp.sponsorship?.title || 'Scholarship'}" (₦${(activeFundedApp.sponsorship?.grantAmount || 0).toLocaleString()}). This conflicts with declarations of having zero active sponsorship aid.`,
      };
    }
  }

  return null;
};

// --- MAIN ENGINE ---

export const runFraudDetection = async (applicationId) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        sponsorship: true,
        documents: true,
      },
    });

    if (!application) throw new Error('Application not found');

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: application.studentId },
      include: { academicRecords: true },
    });

    const triggeredRules = [];

    const rulesToRun = [
      checkAcademicInconsistency(application, studentProfile),
      checkDuplicateApplications(application),
      checkReusedDocuments(application),
      checkMultipleAccounts(application, studentProfile),
      checkConflictingFinancialInfo(application),
    ];

    const results = await Promise.all(rulesToRun);

    results.forEach((res) => {
      if (res) triggeredRules.push(res);
    });

    let overallRisk = 'Low';
    let newStatus = 'Under Sponsor review';
    let newFraudReviewStatus = 'Passed';

    if (triggeredRules.length > 0) {
      if (triggeredRules.some((r) => r.severity === 'High')) {
        overallRisk = 'High';
      } else if (triggeredRules.some((r) => r.severity === 'Medium')) {
        overallRisk = 'Medium';
      } else {
        overallRisk = 'Low';
      }

      await prisma.fraudResult.upsert({
        where: { applicationId: application.id },
        create: {
          applicationId: application.id,
          overallRisk,
          rulesTriggered: JSON.stringify(triggeredRules),
        },
        update: {
          overallRisk,
          rulesTriggered: JSON.stringify(triggeredRules),
        },
      });

      newFraudReviewStatus = 'Flagged';
      newStatus = 'Under Admin review';
    } else {
      newFraudReviewStatus = 'Passed';
      newStatus = 'Under Sponsor review';

      if (application.sponsorship && application.sponsorship.sponsorId) {
        await createNotification(
          application.sponsorship.sponsorId,
          'New Application Received',
          `A new application for ${application.sponsorship.title} has passed automated screening and is ready for your review.`,
          application.id
        );
      }
    }

    const updatedApp = await prisma.application.update({
      where: { id: application.id },
      data: {
        fraudReviewStatus: newFraudReviewStatus,
        status: newStatus,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        sponsorship: true,
        documents: true,
        fraudResult: true,
      },
    });

    return updatedApp;
  } catch (error) {
    console.error(`Fraud Engine Error: ${error.message}`);
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (app) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          fraudReviewStatus: 'Flagged',
          status: 'Under Admin review',
        },
      });

      await prisma.fraudResult.upsert({
        where: { applicationId: app.id },
        create: {
          applicationId: app.id,
          overallRisk: 'High',
          rulesTriggered: JSON.stringify([
            {
              ruleName: 'System Error',
              severity: 'High',
              evidence: 'An internal error occurred during fraud detection. Requires manual admin review.',
            },
          ]),
        },
        update: {
          overallRisk: 'High',
          rulesTriggered: JSON.stringify([
            {
              ruleName: 'System Error',
              severity: 'High',
              evidence: 'An internal error occurred during fraud detection. Requires manual admin review.',
            },
          ]),
        },
      });
    }
  }
};
