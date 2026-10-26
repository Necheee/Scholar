/**
 * Duration helper for scholarship funding lifecycle and cooldown calculation.
 */

/**
 * Parse a human-readable scholarship duration string into total duration in days.
 * Examples:
 * - "1 Academic Session" -> 365 days
 * - "2 Academic Sessions" -> 730 days
 * - "1 Year" / "2 Years" -> 365 / 730 days
 * - "1 Semester" / "6 Months" -> 180 days
 * - "2 Semesters" / "12 Months" -> 365 days
 * - "3 Months" -> 90 days
 * - Default fallback -> 365 days (1 Academic Session)
 */
export const parseDurationToDays = (durationStr) => {
  if (!durationStr || typeof durationStr !== 'string') return 365;

  const text = durationStr.toLowerCase().trim();

  // Explicit months
  const monthMatch = text.match(/(\d+)\s*month/);
  if (monthMatch) {
    return parseInt(monthMatch[1], 10) * 30;
  }

  // Explicit semesters (1 semester = ~180 days)
  const semMatch = text.match(/(\d+)\s*sem/);
  if (semMatch) {
    return parseInt(semMatch[1], 10) * 180;
  }
  if (text.includes('semester')) {
    return 180;
  }

  // Explicit years
  const yearMatch = text.match(/(\d+)\s*year/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10) * 365;
  }

  // Academic sessions (1 session = 365 days)
  const sessionMatch = text.match(/(\d+)\s*(?:academic\s*)?session/);
  if (sessionMatch) {
    return parseInt(sessionMatch[1], 10) * 365;
  }

  // Weeks
  const weekMatch = text.match(/(\d+)\s*week/);
  if (weekMatch) {
    return parseInt(weekMatch[1], 10) * 7;
  }

  return 365;
};

/**
 * Calculates whether an awarded/disbursed application is currently actively funded based on duration.
 * @param {Object} application Application record (with populated sponsorship)
 * @returns {Object} { isFundedActive: boolean, startDate: Date, endDate: Date, daysRemaining: number }
 */
export const getFundingStatus = (application) => {
  if (!application) {
    return { isFundedActive: false, startDate: null, endDate: null, daysRemaining: 0 };
  }

  if (application.status !== 'Grant Disbursed' && application.status !== 'Approved') {
    return { isFundedActive: false, startDate: null, endDate: null, daysRemaining: 0 };
  }

  const startDate = new Date(application.disbursedAt || application.updatedAt || application.createdAt);
  const durationDays = parseDurationToDays(application.sponsorship?.duration);
  const endDate = application.fundingEndDate
    ? new Date(application.fundingEndDate)
    : new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const now = new Date();
  const isFundedActive = now < endDate;
  const daysRemaining = isFundedActive ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return {
    isFundedActive,
    startDate,
    endDate,
    daysRemaining,
  };
};

