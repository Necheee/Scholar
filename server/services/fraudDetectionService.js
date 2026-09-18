import Application from '../models/Application.js';
import FraudResult from '../models/FraudResult.js';
import StudentProfile from '../models/StudentProfile.js';

// --- FRAUD RULES ---

const checkAcademicInconsistency = async (application, studentProfile) => {
  // If the student provided academic info in the application that drastically
  // differs from their latest profile info, flag it.
  
  if (!application.academicInfoSnapshot || !studentProfile.academicRecords || studentProfile.academicRecords.length === 0) {
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
    status: { $in: ['Rejected', 'Approved'] } // Only compare against completed past apps
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

// --- MAIN ENGINE ---

export const runFraudDetection = async (applicationId) => {
  try {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application not found');

    const studentProfile = await StudentProfile.findOne({ user: application.student });
    
    const triggeredRules = [];

    // Run modular rules
    const rulesToRun = [
      checkAcademicInconsistency(application, studentProfile),
      checkDuplicateApplications(application)
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

