/**
 * Scholar Defense Demonstration Script: Rule-Based Fraud Detection Engine
 * 
 * Run with:
 *   node scripts/demoRuleEngine.js
 * or:
 *   npm run demo:rules
 */

const divider = '─'.repeat(65);
const doubleDivider = '═'.repeat(65);

console.clear();
console.log('\n' + doubleDivider);
console.log('       SCHOLAR DEFENSE DEMO: RULE-BASED FRAUD DETECTION');
console.log(doubleDivider);
console.log('Automated Integrity Screening with Human-in-the-Loop Governance\n');

// 1. ENGINE LOGIC
function evaluateApplication(studentProfile, application, pastApplications = []) {
  const triggeredRules = [];

  // Rule 1: Academic Consistency Check
  if (application.academicSnapshot && studentProfile.academicRecord) {
    const profile = studentProfile.academicRecord;
    const app = application.academicSnapshot;

    const programmeMismatch = profile.programme.toLowerCase().trim() !== app.programme.toLowerCase().trim();
    const levelMismatch = profile.level.trim() !== app.level.trim();

    if (programmeMismatch || levelMismatch) {
      triggeredRules.push({
        rule: 'Academic Record Inconsistency',
        severity: 'Medium',
        evidence: `Application claims '${app.programme}' (${app.level}), but official student profile confirms '${profile.programme}' (${profile.level}).`
      });
    }
  }

  // Rule 2: Recycled / Plagiarized Application Materials
  for (const prev of pastApplications) {
    if (prev.reason && application.reason && prev.reason.trim() === application.reason.trim()) {
      triggeredRules.push({
        rule: 'Recycled Application Material',
        severity: 'Low',
        evidence: `Motivation statement matches character-for-character with prior application (#${prev.id}).`
      });
    }
  }

  // Workflow Decision
  const isFlagged = triggeredRules.length > 0;
  let overallRisk = 'None';
  let routingDestination = '';

  if (isFlagged) {
    if (triggeredRules.some(r => r.severity === 'High')) overallRisk = 'High';
    else if (triggeredRules.some(r => r.severity === 'Medium')) overallRisk = 'Medium';
    else overallRisk = 'Low';

    routingDestination = 'ADMIN FRAUD QUEUE (/admin/flagged) -> Human-in-the-loop review';
  } else {
    routingDestination = 'SPONSOR REVIEW QUEUE -> Direct to sponsor (Fraud data hidden)';
  }

  return { isFlagged, overallRisk, triggeredRules, routingDestination };
}

// 2. DEMONSTRATION SCENARIOS
const scenarios = [
  {
    title: 'SCENARIO 1: Legitimate Application (Matching Records & Unique Essay)',
    student: { name: 'Alex Johnson', academicRecord: { programme: 'Computer Science', level: '300-level' } },
    application: {
      applicant: 'Alex Johnson',
      academicSnapshot: { programme: 'Computer Science', level: '300-level' },
      reason: 'I am seeking sponsorship to support my final year tuition and capstone project on AI accessibility.'
    },
    pastApplications: [
      { id: 'APP-101', reason: 'Assistance needed for 200-level registration fees in 2024.' }
    ]
  },
  {
    title: 'SCENARIO 2: Academic Inconsistency (Level & Programme Discrepancy)',
    student: { name: 'Chiamaka Okafor', academicRecord: { programme: 'Computer Engineering', level: '300-level' } },
    application: {
      applicant: 'Chiamaka Okafor',
      academicSnapshot: { programme: 'Software Engineering', level: '400-level' },
      reason: 'Applying for hardware grant to build IoT monitors.'
    },
    pastApplications: []
  },
  {
    title: 'SCENARIO 3: Plagiarism / Recycled Application Material',
    student: { name: 'David Adeleke', academicRecord: { programme: 'Electrical Electronics', level: '400-level' } },
    application: {
      applicant: 'David Adeleke',
      academicSnapshot: { programme: 'Electrical Electronics', level: '400-level' },
      reason: 'I am in dire need of financial assistance due to unforeseen family hardship this semester.'
    },
    pastApplications: [
      { id: 'APP-089', reason: 'I am in dire need of financial assistance due to unforeseen family hardship this semester.' }
    ]
  }
];

// 3. EXECUTE DEMONSTRATION
scenarios.forEach((s, idx) => {
  console.log(divider);
  console.log(`[${idx + 1}/3] ${s.title}`);
  console.log(divider);
  console.log(`• Applicant:          ${s.application.applicant}`);
  console.log(`• Profile on File:    ${s.student.academicRecord.programme} (${s.student.academicRecord.level})`);
  console.log(`• Submitted on Form:  ${s.application.academicSnapshot.programme} (${s.application.academicSnapshot.level})`);
  console.log(`• Statement Preview:  "${s.application.reason.substring(0, 55)}..."`);

  const result = evaluateApplication(s.student, s.application, s.pastApplications);

  console.log('\n  SCREENING OUTCOME:');
  if (result.isFlagged) {
    console.log(`  ⚠ STATUS:           FLAGGED (Overall Risk: ${result.overallRisk})`);
    result.triggeredRules.forEach(r => {
      console.log(`    - [${r.severity} Risk] ${r.rule}`);
      console.log(`      Evidence: ${r.evidence}`);
    });
  } else {
    console.log(`  ✓ STATUS:           CLEARED (Passed automated screening)`);
    console.log(`    - 0 integrity violations detected.`);
  }

  console.log(`  ➔ ROUTING DECISION: ${result.routingDestination}\n`);
});

console.log(doubleDivider);
console.log('SUMMARY FOR DEFENSE PANEL:');
console.log('1. Deterministic & Explainable: Generates auditable evidence for every flag.');
console.log('2. Human-in-the-Loop: Flagged applications require Admin adjudication.');
console.log('3. Zero Bias: Sponsors only receive applications that have cleared screening.');
console.log(doubleDivider + '\n');

