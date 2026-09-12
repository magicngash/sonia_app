import { TutorSettings, LessonSession } from '../types';

/**
 * Convert "HH:mm" to total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes from midnight to "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Checks if two time spans overlap
 */
export function doSpansOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Calculate available slots for a given date
 */
export function getAvailableSlotsForDate(
  dateStr: string, // YYYY-MM-DD
  durationMinutes: number,
  tutorSettings: TutorSettings,
  sessions: LessonSession[]
): { time: string; available: boolean; conflictReason?: string }[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  const dayConfig = tutorSettings.workingHours[dayOfWeek];
  if (!dayConfig || !dayConfig.enabled) {
    return [];
  }

  const workStart = timeToMinutes(dayConfig.start);
  const workEnd = timeToMinutes(dayConfig.end);
  const buffer = tutorSettings.bufferMinutes;

  // Active sessions on this date (not cancelled)
  const dateSessions = sessions.filter(
    s => s.date === dateStr && s.status !== 'cancelled'
  );

  // Blocked slots on this date
  const dateBlocks = tutorSettings.blockedSlots.filter(b => b.date === dateStr);

  const slots: { time: string; available: boolean; conflictReason?: string }[] = [];
  let currentStart = workStart;

  // Step size: 30 minutes or durationMinutes
  const stepMinutes = 30;

  while (currentStart + durationMinutes <= workEnd) {
    const currentEnd = currentStart + durationMinutes;
    const timeStr = minutesToTime(currentStart);

    let conflict = false;
    let conflictReason = '';

    // Check conflict with sessions (including buffer)
    for (const session of dateSessions) {
      const sessStart = timeToMinutes(session.startTime);
      const sessEnd = sessStart + session.durationMinutes;

      // When checking overlap, tutor needs bufferMinutes after or before
      const sessStartWithBuffer = Math.max(0, sessStart - buffer);
      const sessEndWithBuffer = sessEnd + buffer;

      if (doSpansOverlap(currentStart, currentEnd, sessStartWithBuffer, sessEndWithBuffer)) {
        conflict = true;
        conflictReason = `Occupied: ${session.subject} (${session.startTime})`;
        break;
      }
    }

    // Check conflict with blocked slots
    if (!conflict) {
      for (const block of dateBlocks) {
        const bStart = timeToMinutes(block.startTime);
        const bEnd = timeToMinutes(block.endTime);

        if (doSpansOverlap(currentStart, currentEnd, bStart, bEnd)) {
          conflict = true;
          conflictReason = `Tutor Blocked: ${block.title}`;
          break;
        }
      }
    }

    slots.push({
      time: timeStr,
      available: !conflict,
      conflictReason: conflict ? conflictReason : undefined,
    });

    currentStart += stepMinutes;
  }

  return slots;
}

/**
 * Adds weeks to an ISO date string (YYYY-MM-DD) avoiding timezone shifts
 */
export function addWeeksToDate(dateStr: string, weeks: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return date.toISOString().split('T')[0];
}

/**
 * Returns an array of dates occurring every 7 days from the start date for `weeksCount`
 */
export function getRecurringDates(startDateStr: string, weeksCount: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < weeksCount; i++) {
    dates.push(addWeeksToDate(startDateStr, i));
  }
  return dates;
}

export interface RecurringDateCheck {
  date: string;
  formattedDate: string;
  weekIndex: number; // 1-based index (e.g. 1 of 12)
  available: boolean;
  conflictReason?: string;
}

/**
 * Validates a recurring slot at `startTime` for `weeksCount` (e.g. 12 weeks = 3 months)
 */
export function checkRecurringDatesAvailability(
  startDateStr: string,
  startTime: string,
  durationMinutes: number,
  weeksCount: number,
  tutorSettings: TutorSettings,
  sessions: LessonSession[]
): {
  allAvailable: boolean;
  availableCount: number;
  totalCount: number;
  dates: RecurringDateCheck[];
} {
  const recurringDates = getRecurringDates(startDateStr, weeksCount);
  const results: RecurringDateCheck[] = [];
  let availableCount = 0;

  recurringDates.forEach((dStr, idx) => {
    const slots = getAvailableSlotsForDate(dStr, durationMinutes, tutorSettings, sessions);
    const targetSlot = slots.find(s => s.time === startTime);

    const [y, m, d] = dStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    if (targetSlot && targetSlot.available) {
      availableCount++;
      results.push({
        date: dStr,
        formattedDate: formatted,
        weekIndex: idx + 1,
        available: true,
      });
    } else {
      results.push({
        date: dStr,
        formattedDate: formatted,
        weekIndex: idx + 1,
        available: false,
        conflictReason: targetSlot?.conflictReason || 'Slot not within working hours or occupied',
      });
    }
  });

  return {
    allAvailable: availableCount === weeksCount,
    availableCount,
    totalCount: weeksCount,
    dates: results,
  };
}
