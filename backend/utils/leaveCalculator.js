/**
 * Calculate business days between startDate and endDate (inclusive),
 * automatically excluding Saturdays and Sundays (Weekend Exclusion / Sandwich Rule).
 *
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {number} number of business days
 */
export const calculateBusinessDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Normalize hours to prevent timezone hour miscounts
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (end < start) {
    return 0;
  }

  let businessDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays += 1;
    }
    current.setDate(current.getDate() + 1);
  }

  return businessDays;
};

/**
 * Check if two date ranges overlap.
 * Range 1: [start1, end1]
 * Range 2: [start2, end2]
 */
export const isDateRangeOverlapping = (start1, end1, start2, end2) => {
  const s1 = new Date(start1).setHours(0, 0, 0, 0);
  const e1 = new Date(end1).setHours(0, 0, 0, 0);
  const s2 = new Date(start2).setHours(0, 0, 0, 0);
  const e2 = new Date(end2).setHours(0, 0, 0, 0);

  return s1 <= e2 && e1 >= s2;
};
