/**
 * Standalone Unit Test Runner for Scholar Rule-Based Fraud Detection Engine
 * 
 * Run with:
 *   node scripts/testFraudRules.js
 */

console.log('====================================================');
console.log('   SCHOLAR: RULE-BASED FRAUD ENGINE TEST SUITE      ');
console.log('====================================================\n');

// 1. REPRODUCE RULE LOGIC DIRECTLY FOR ISOLATED TESTING
const checkAcademicInconsistency = (application, studentProfile) => {
  if (!application.academicInfoSnapshot || !studentProfile || !studentProfile.academicRecords || studentProfile.academicRecords.length === 0) {
    return null;
  }

  const latestRecord = studentProfile.academicRecords[studentProfile.academicRecords.length - 1];
  const appInfo = application.academicInfoSnapshot;

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

const checkDuplicateApplications = (application, previousApps = []) => {
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
const checkReusedDocuments = (application, otherApps = []) => {
  if (!application.documents || application.documents.length === 0) return null;
  const hashes = application.documents.map((d) => d.fileHash).filter(Boolean);
  if (hashes.length === 0) return null;

  for (let other of otherApps) {
    if (other._id?.toString() !== application._id?.toString() && other.student?.toString() !== application.student?.toString()) {
      const match = other.documents?.find((d) => hashes.includes(d.fileHash));
      if (match) {
        return {
          ruleName: 'Reused Document (Cross-Applicant Identity / Credential Sharing)',
          severity: 'High',
          evidence: `A submitted document (${match.type || 'Credential'}) shares an identical cryptographic SHA-256 hash with a file previously submitted by another applicant (${other.studentEmail || other.student}).`,
        };
      }
    }
  }
  return null;
};

// Planned Rule from Chapter 1.7 (P66) & 3.4.3 (P154)
const checkMultipleAccounts = (currentUser, currentProfile, otherUsersWithProfiles = []) => {
  if (!currentProfile || !currentProfile.institution || !currentProfile.department) return null;

  for (const other of otherUsersWithProfiles) {
    if (other.userId !== currentUser._id) {
      const isSameDept = other.institution?.toLowerCase() === currentProfile.institution?.toLowerCase() &&
                         other.department?.toLowerCase() === currentProfile.department?.toLowerCase();
      const currentName = currentUser.name.toLowerCase().replace(/[^a-z]/g, '');
      const otherName = other.name.toLowerCase().replace(/[^a-z]/g, '');

      if (isSameDept && currentName.length > 3 && currentName === otherName) {
        return {
          ruleName: 'Multiple Accounts (Identity Duplication)',
          severity: 'High',
          evidence: `Student identity '${currentUser.name}' matches another registered account (${other.email}) in department '${currentProfile.department}'.`,
        };
      }
    }
  }
  return null;
};

// Planned Rule from Chapter 1.7 (P65) & 3.4.3 (P154)
const checkConflictingFinancialInfo = (application, pastActiveGrants = []) => {
  for (const grant of pastActiveGrants) {
    if (grant.isStillActive) {
      const reasonText = (application.reasonForRequesting || '').toLowerCase();
      const claimsZeroAid = /no financial (aid|support|assistance)|zero (aid|support|funding)|never received (any|a) (scholarship|grant|sponsorship)|no other source of funding/i.test(reasonText);

      return {
        ruleName: 'Conflicting Financial Information',
        severity: claimsZeroAid ? 'High' : 'Medium',
        evidence: `Applicant currently holds an active funded grant under "${grant.sponsorshipTitle}" (₦${(grant.amount || 0).toLocaleString()}). This conflicts with declarations of having zero active sponsorship aid.`,
      };
    }
  }
  return null;
};

const evaluateRisk = (triggeredRules) => {
  if (triggeredRules.length === 0) return { risk: 'None', status: 'Passed', nextStatus: 'Under Sponsor review' };
  
  let overallRisk = 'Low';
  if (triggeredRules.some(r => r.severity === 'High')) {
    overallRisk = 'High';
  } else if (triggeredRules.some(r => r.severity === 'Medium')) {
    overallRisk = 'Medium';
  }
  
  return {
    risk: overallRisk,
    status: 'Flagged',
    nextStatus: 'Under Admin review'
  };
};

// 2. TEST CASES
let passedCount = 0;
let totalCount = 0;

function assert(condition, testName, details = '') {
  totalCount++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error(`   Details: ${details}`);
  }
}

// TEST 1: Consistent application passes rule
{
  const profile = {
    academicRecords: [{ programme: 'Computer Science', level: '300' }]
  };
  const app = {
    academicInfoSnapshot: { programme: 'Computer Science', level: '300' }
  };
  const result = checkAcademicInconsistency(app, profile);
  assert(result === null, 'Test 1: Identical profile and application details should PASS');
}

// TEST 2: Programme mismatch triggers Medium severity flag
{
  const profile = {
    academicRecords: [{ programme: 'Computer Science', level: '300' }]
  };
  const app = {
    academicInfoSnapshot: { programme: 'Electrical Engineering', level: '300' }
  };
  const result = checkAcademicInconsistency(app, profile);
  assert(
    result !== null && result.ruleName === 'Academic Record Inconsistency' && result.severity === 'Medium',
    'Test 2: Programme mismatch flags Academic Record Inconsistency (Medium severity)'
  );
}

// TEST 3: Level mismatch triggers Medium severity flag
{
  const profile = {
    academicRecords: [{ programme: 'Computer Science', level: '300' }]
  };
  const app = {
    academicInfoSnapshot: { programme: 'Computer Science', level: '400' }
  };
  const result = checkAcademicInconsistency(app, profile);
  assert(
    result !== null && result.severity === 'Medium',
    'Test 3: Level mismatch flags Academic Record Inconsistency'
  );
}

// TEST 4: Recycled / duplicate motivation text
{
  const app = {
    reasonForRequesting: 'I need financial assistance to complete my tuition fees this semester.'
  };
  const pastApps = [
    {
      _id: 'app_prev_001',
      status: 'Rejected',
      reasonForRequesting: 'I need financial assistance to complete my tuition fees this semester.'
    }
  ];
  const result = checkDuplicateApplications(app, pastApps);
  assert(
    result !== null && result.ruleName === 'Recycled Application Material' && result.severity === 'Low',
    'Test 4: Exact copy-paste of previous essay flags Recycled Application Material (Low severity)'
  );
}

// TEST 5: Unique essay passes duplicate check
{
  const app = {
    reasonForRequesting: 'This is a brand new essay written specifically for this engineering scholarship.'
  };
  const pastApps = [
    {
      _id: 'app_prev_001',
      status: 'Rejected',
      reasonForRequesting: 'Old reason from last year.'
    }
  ];
  const result = checkDuplicateApplications(app, pastApps);
  assert(result === null, 'Test 5: Distinct application essay should PASS duplicate check');
}

// TEST 6: Overall Risk & Workflow Routing - Clean Application
{
  const evaluation = evaluateRisk([]);
  assert(
    evaluation.status === 'Passed' && evaluation.nextStatus === 'Under Sponsor review',
    'Test 6: Clean application bypasses admin and goes directly to "Under Sponsor review"'
  );
}

// TEST 7: Overall Risk & Workflow Routing - Flagged Application
{
  const triggered = [
    { ruleName: 'Academic Record Inconsistency', severity: 'Medium' }
  ];
  const evaluation = evaluateRisk(triggered);
  assert(
    evaluation.risk === 'Medium' && evaluation.status === 'Flagged' && evaluation.nextStatus === 'Under Admin review',
    'Test 7: Flagged application routes to "Under Admin review" for human-in-the-loop inspection'
  );
}

// TEST 8: Reused Document Cryptographic SHA-256 Hash Matching (Chapter 1.7 & 3.4.5)
{
  const app = {
    _id: 'app_new_101',
    student: 'student_user_1',
    documents: [{ type: 'Transcript', fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }]
  };
  const existingApps = [
    {
      _id: 'app_old_005',
      student: 'student_user_2',
      studentEmail: 'imposter@unn.edu.ng',
      documents: [{ type: 'Transcript', fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }]
    }
  ];
  const result = checkReusedDocuments(app, existingApps);
  assert(
    result !== null && result.ruleName.includes('Reused Document') && result.severity === 'High',
    'Test 8: Matching document SHA-256 hash across different applicants flags Reused Document (High severity)'
  );
}

// TEST 9: Multiple Accounts Rule (Chapter 1.7 P66 & Chapter 3.4.3 P154)
{
  const currentUser = { _id: 'user_002', name: 'Emeka Okafor' };
  const currentProfile = { institution: 'University of Nigeria, Nsukka', department: 'Computer Science' };
  const otherUsers = [
    {
      userId: 'user_001',
      name: 'Emeka Okafor',
      email: 'emeka.alt@gmail.com',
      institution: 'University of Nigeria, Nsukka',
      department: 'Computer Science'
    }
  ];
  const result = checkMultipleAccounts(currentUser, currentProfile, otherUsers);
  assert(
    result !== null && result.ruleName.includes('Multiple Accounts') && result.severity === 'High',
    'Test 9: Duplicate student profile detected across distinct accounts flags Multiple Accounts (High severity)'
  );
}

// TEST 10: Conflicting Financial Information Rule (Chapter 1.7 P65 & Chapter 3.4.3 P154)
{
  const app = {
    reasonForRequesting: 'I currently have zero aid and have never received any scholarship.'
  };
  const activeGrants = [
    {
      sponsorshipTitle: 'Chevron STEM Merit Grant',
      amount: 350000,
      isStillActive: true
    }
  ];
  const result = checkConflictingFinancialInfo(app, activeGrants);
  assert(
    result !== null && result.ruleName.includes('Conflicting Financial Information') && result.severity === 'High',
    'Test 10: Disbursed grant co-occurring with claim of zero funding flags Conflicting Financial Information (High severity)'
  );
}

console.log('\n----------------------------------------------------');
console.log(`Results: ${passedCount}/${totalCount} tests passed.`);
console.log('====================================================\n');

