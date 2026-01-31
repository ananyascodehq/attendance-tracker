import { AttendanceLog, Holiday, TimetableSlot, AttendanceStats, OverallStats } from '@/types';
import { isAfter, isBefore, parseISO, isSameDay } from 'date-fns';
import { ATTENDANCE_THRESHOLD } from './constants';

export const isHoliday = (date: string, holidays: Holiday[]): boolean => {
  return holidays.some((h) => h.date === date);
};

export const getClassesHeldTill = (
  date: string,
  timetable: TimetableSlot[],
  holidays: Holiday[],
  bySubject?: string
): number => {
  const targetDate = parseISO(date);
  let count = 0;

  timetable.forEach((slot) => {
    if (bySubject && slot.subject_code !== bySubject) return;

    const slotDate = new Date(date.split('-').slice(0, 3).join('-'));
    // Simplified: assumes timetable repeats weekly

    if (!isHoliday(slot.day_of_week, holidays)) {
      count++;
    }
  });

  return count;
};

export const calculateAttendance = (
  subjectCode: string,
  attendanceLogs: AttendanceLog[],
  timetable: TimetableSlot[],
  holidays: Holiday[],
  upToDate: string
): { present: number; absent: number; od: number; total: number } => {
  const upToDateObj = parseISO(upToDate);
  const targetDate = parseISO(upToDate);

  const subjectSlots = timetable.filter((slot) => slot.subject_code === subjectCode);
  const relevantLogs = attendanceLogs.filter(
    (log) =>
      log.subject_code === subjectCode &&
      !isAfter(parseISO(log.date), upToDateObj)
  );

  let total = 0;
  let present = 0;
  let absent = 0;
  let od = 0;

  // Count total classes held up to date
  const uniqueDates = new Set<string>();
  subjectSlots.forEach((slot) => {
    // This is simplified - in production, you'd need to generate actual dates
    // based on the semester start and the weekly timetable pattern
  });

  relevantLogs.forEach((log) => {
    if (log.status === 'present') present++;
    else if (log.status === 'absent') absent++;
    else if (log.status === 'od') od++;
  });

  total = present + absent + od;

  return { present, absent, od, total };
};

export const calculatePercentage = (present: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

export const getStatusColor = (percentage: number): 'safe' | 'caution' | 'danger' => {
  if (percentage > 80) return 'safe';
  if (percentage >= ATTENDANCE_THRESHOLD) return 'caution';
  return 'danger';
};

export const calculateSafeMargin = (
  present: number,
  total: number,
  futureClasses: number
): number => {
  const minRequired = Math.ceil(ATTENDANCE_THRESHOLD / 100 * (total + futureClasses));
  const stillNeeded = Math.max(0, minRequired - present);
  return Math.max(0, futureClasses - stillNeeded);
};

export const calculateOverallStats = (
  subjectStats: AttendanceStats[]
): OverallStats => {
  const total = subjectStats.reduce((sum, s) => sum + s.total_classes, 0);
  const present = subjectStats.reduce((sum, s) => sum + s.present, 0);
  const absent = subjectStats.reduce((sum, s) => sum + s.absent, 0);
  const od = subjectStats.reduce((sum, s) => sum + s.od, 0);
  const percentage = calculatePercentage(present + od, total);
  const status = getStatusColor(percentage);

  return {
    total_classes: total,
    present,
    absent,
    od,
    percentage,
    status,
  };
};
