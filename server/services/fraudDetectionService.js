import Application from '../models/Application.js';
import FraudResult from '../models/FraudResult.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import { createNotification } from './notificationService.js';

// --- FRAUD RULES ---

const checkAcademicInconsistency = async (application, studentProfile) => {
  // If the student provided academic info in the application that drastically
  // differs from their latest profile info, flag it.
  
  if (!application.academicInfoSnapshot || !studentProfile || !studentProfile.academicRecords || studentProfile.academicRecords.length === 0) {
    return null; // Not enough data to compare
  }

  // Get the most recent academic record from the profile (assuming last is most recent)
  const latestRecord = studentProfile.academicRecords[studentProfile.academicRecords.length - 1];
  const appInfo = application.academicInfoSnapshot;

  // Check if they claim a different institution or programme
  // Note: For a real system, string similarity algorithms (like Levenshtein) would be better here.
  if (
    latestRecord.programme.toLowerCase().trim() !== appInfo.programme.toLowerCase().trim() ||
    latestRecord.level !== appInfo.level
  ) {
    return {
      ruleName: 'Academic Record Inconsistency',
      severity: 'Medium',
      evidence: `Application states programme '${appInfo.programme}' at level '${appInfo.level}', but profile states '${latestRecord.programme}' at level '${latestRecord.level}'.`,
    };
  }

  return null;
};

const checkDuplicateApplications = async (application) => {
  // Find if the student has applied to other sponsorships with the exact same reason/documents
  // This is a simple check for copy-pasting applications
  
  const previousApps = await Application.find({
    student: application.student,
    _id: { $ne: application._id },
    status: { $in: ['Rejected', 'Approved', 'Grant Disbursed'] } // Only compare against completed past apps
  });

  for (let prev of previousApps) {
    if (prev.reasonForRequesting && application.reasonForRequesting) {
      if (prev.reasonForRequesting.trim() === application.reasonForRequesting.trim()) {
        return {
          ruleName: 'Recycled Application Material',
          severity: 'Low',
          evidence: `The 'Reason for Requesting Sponsorship' exactly matches a previous application (${prev._id}).`,
        };
      }
    }
  }

  return null;
};

// Planned Rule from Chapter 1.7, 3.4.3 & 3.4.5 Document Table (file_hash)
// Detects forged, duplicated, or shared credential documents across applicants
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

  // Cross-reference against applications submitted by other students
  const match = await Application.findOne({
    _id: { $ne: application._id },
    student: { $ne: application.student },
    'documents.fileHash': { $in: hashes },
  }).populate('student', 'name email');

  if (match) {
    const reusedDoc = match.documents?.find((d) => hashes.includes(d.fileHash));
    return {
      ruleName: 'Reused Document (Cross-Applicant Identity / Credential Sharing)',
      severity: 'High',
      evidence: `A submitted document (${reusedDoc?.type || 'Credential'}) shares an identical cryptographic SHA-256 hash with a file previously submitted by another applicant (${match.student?.email || 'Applicant ID ' + match.student}).`,
    };
  }

  return null;
};

// Planned Rule from Chapter 1.7 (P66) & 3.4.3 (P154)
// Detects if a student operates multiple accounts to submit duplicate applications
const checkMultipleAccounts = async (application, studentProfile) => {
  if (!studentProfile || !studentProfile.institution || !studentProfile.department) {
    return null;
  }

  const currentUser = await User.findById(application.student);
  if (!currentUser) return null;

  // Search for another student profile at the same institution & department with a different account
  const otherProfiles = await StudentProfile.find({
    user: { $ne: currentUser._id },
    institution: { $regex: new RegExp(`^${studentProfile.institution.trim()}$`, 'i') },
    department: { $regex: new RegExp(`^${studentProfile.department.trim()}$`, 'i') },
  }).populate('user', 'name email');

  for (const other of otherProfiles) {
    if (!other.user) continue;

    // Compare normalized full names
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

// Planned Rule from Chapter 1.7 (P65) & 3.4.3 (P154)
// Detects conflicting financial declarations (e.g. claiming zero aid while actively receiving funding)
const checkConflictingFinancialInfo = async (application) => {
  // Find any active or previously disbursed grants for this student
  const activeFundedApp = await Application.findOne({
    student: application.student,
    _id: { $ne: application._id },
    status: { $in: ['Grant Disbursed', 'Approved'] },
  }).populate('sponsorship', 'title amount duration');

  if (activeFundedApp) {
    const isStillActive = !activeFundedApp.fundingEndDate || new Date(activeFundedApp.fundingEndDate) > new Date();
    
    if (isStillActive) {
      const reasonText = (application.reasonForRequesting || '').toLowerCase();
      // If the applicant claims to have received no prior aid or zero financial support
      const claimsZeroAid = /no financial (aid|support|assistance)|zero (aid|support|funding)|never received (any|a) (scholarship|grant|sponsorship)|no other source of funding/i.test(reasonText);

      return {
        ruleName: 'Conflicting Financial Information',
        severity: claimsZeroAid ? 'High' : 'Medium',
        evidence: `Applicant currently holds an active funded grant under "${activeFundedApp.sponsorship?.title || 'Scholarship'}" (₦${(activeFundedApp.sponsorship?.amount || 0).toLocaleString()}). This conflicts with declarations of having zero active sponsorship aid.`,
      };
    }
  }

  return null;
};

// --- MAIN ENGINE ---

export const runFraudDetection = async (applicationId) => {
  try {
    const application = await Application.findById(applicationId).populate('sponsorship');
    if (!application) throw new Error('Application not found');

    const studentProfile = await StudentProfile.findOne({ user: application.student });
    
    const triggeredRules = [];

    // Run modular rules
    const rulesToRun = [
      checkAcademicInconsistency(application, studentProfile),
      checkDuplicateApplications(application),
      checkReusedDocuments(application),
      checkMultipleAccounts(application, studentProfile),
      checkConflictingFinancialInfo(application),
    ];

    const results = await Promise.all(rulesToRun);

    // Collect triggered rules
    results.forEach((res) => {
      if (res) triggeredRules.push(res);
    });

    // Evaluate overall risk
    let overallRisk = 'Low';
    if (triggeredRules.length > 0) {
      if (triggeredRules.some(r => r.severity === 'High')) {
        overallRisk = 'High';
      } else if (triggeredRules.some(r => r.severity === 'Medium')) {
        overallRisk = 'Medium';
      } else {
        overallRisk = 'Low';
      }

      // Create Fraud Result record
      await FraudResult.create({
        application: application._id,
        overallRisk,
        rulesTriggered: triggeredRules,
      });

      // Update application status
      application.fraudReviewStatus = 'Flagged';
      application.status = 'Under Admin review'; // Handled by Admin because it's flagged
    } else {
      application.fraudReviewStatus = 'Passed';
      application.status = 'Under Sponsor review'; // Passed screening, goes directly to Sponsor
      
      if (application.sponsorship && application.sponsorship.sponsor) {
        await createNotification(
          application.sponsorship.sponsor, 
          'New Application Received', 
          `A new application for ${application.sponsorship.title} has passed automated screening and is ready for your review.`, 
          application._id
        );
      }
    }

    await application.save();
    return application;

  } catch (error) {
    console.error(`Fraud Engine Error: ${error.message}`);
    // If the fraud engine fails, default to safe mode (Flag for Admin review)
    const app = await Application.findById(applicationId);
    if (app) {
      app.fraudReviewStatus = 'Flagged';
      app.status = 'Under Admin review';
      await app.save();
      
      await FraudResult.create({
        application: app._id,
        overallRisk: 'High',
        rulesTriggered: [{
          ruleName: 'System Error',
          severity: 'High',
          evidence: 'An internal error occurred during fraud detection. Requires manual admin review.',
        }]
      });
    }
  }
};

