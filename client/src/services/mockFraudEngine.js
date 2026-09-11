export function analyzeApplication(formData) {
  const rules = [];
  let score = 0;
  
  // Rule 1: Brief motivation statement
  if (formData.motivation && formData.motivation.length < 50) {
    rules.push({
      id: Date.now() + 1,
      severity: 'Low',
      name: 'Brief Motivation Statement',
      explanation: 'Motivation statement is unusually short, which might indicate a lack of serious intent.'
    });
    score += 1;
  }
  
  // Rule 2: Suspicious GPA
  const gpa = parseFloat(formData.gpa);
  if (gpa > 4.0 || gpa < 1.0) {
    rules.push({
      id: Date.now() + 2,
      severity: 'High',
      name: 'Unrealistic Academic Record',
      explanation: `GPA stated is ${formData.gpa}, which is outside normal academic bounds.`
    });
    score += 5;
  }

  // Rule 3: Suspicious keywords in goals
  const goalsLower = (formData.goals || '').toLowerCase();
  if (goalsLower.includes('scam') || goalsLower.includes('test') || goalsLower.includes('fake')) {
    rules.push({
      id: Date.now() + 3,
      severity: 'Medium',
      name: 'Suspicious Keywords',
      explanation: 'Application goals contain keywords often associated with test or fraudulent submissions.'
    });
    score += 3;
  }
  
  // Rule 4: Year of study mismatch heuristic (mocking logic)
  if (formData.year === 'freshman' && gpa > 3.9) {
     rules.push({
      id: Date.now() + 4,
      severity: 'Medium',
      name: 'High GPA for Freshman',
      explanation: 'Freshman reporting near-perfect GPA in first semester requires manual verification of transcripts.'
    });
    score += 2;
  }

  let riskLevel = 'Low';
  if (score >= 5) riskLevel = 'High';
  else if (score >= 3) riskLevel = 'Medium';

  return {
    isFlagged: riskLevel !== 'Low',
    riskLevel,
    rulesTriggered: rules.length,
    rules,
    dateFlagged: new Date().toISOString(),
  };
}

