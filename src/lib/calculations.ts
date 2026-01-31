import {
  AttendanceLog,
  Holiday,
  TimetableSlot,
  AttendanceStats,
  OverallStats,
  Subject,
  SemesterConfig,
  ODLog,
} from '@/types';
import {
  PER_SUBJECT_MINIMUM,
  OVERALL_MINIMUM,
  PER_SUBJECT_WARNING,
  OVERALL_WARNING,
  MAX_OD_HOURS,
  COLOR_THRESHOLDS,
} from './constants';
import { parseISO, isBefore, isAfter, isSameDay, eachDayOfInterval, getDay, format } from 'date-fns';

// SPEC 2.3: Check if a date is a holiday
export const isHoliday = (date: string, holidays: Holiday[]): boolean => {
  return holidays.some((h) => h.date === date);
};

// Map day index (0=Sunday, 1=Monday, ...) to day name
const dayIndexToName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

// Check if a date falls within any CAT exam period
const isInCATExamPeriod = (dateStr: string, semesterConfig: SemesterConfig | null): boolean => {
  if (!semesterConfig?.cat_periods) return false;
  
  const date = parseISO(dateStr);
  
  for (const cat of semesterConfig.cat_periods) {
    const catStart = parseISO(cat.start_date);
    const catEnd = parseISO(cat.end_date);
    
    if (!isBefore(date, catStart) && !isAfter(date, catEnd)) {
      return true;
    }
  }
  
  return false;
};

// Calculate scheduled sessions from semester start date to a given date
export const getScheduledSessionsUntilDate = (
  subjectCode: string | undefined,
  timetable: TimetableSlot[],
  semesterConfig: SemesterConfig | null,
  holidays: Holiday[],
  upToDate: string
): number => {
  if (!semesterConfig) return 0;

  const startDate = parseISO(semesterConfig.start_date);
  const endDate = parseISO(upToDate);

  // If end date is before start date, return 0
  if (isBefore(endDate, startDate)) return 0;

  // Get all slots for this subject
  const subjectSlots = timetable.filter((slot) => slot.subject_code === subjectCode);

  if (subjectSlots.length === 0) return 0;

  // Get holiday dates as strings for easy comparison
  const holidayDates = new Set(holidays.map((h) => h.date));

  // Get all days from semester start to upToDate
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });

  let scheduledCount = 0;

  for (const day of allDays) {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayName = dayIndexToName(getDay(day));

    // Skip if it's a holiday, Sunday, or during CAT exam period
    if (holidayDates.has(dateStr) || dayName === 'Sunday' || isInCATExamPeriod(dateStr, semesterConfig)) continue;

    // Count how many periods this subject has on this day
    const periodsOnThisDay = subjectSlots.filter((slot) => slot.day_of_week === dayName).length;
    scheduledCount += periodsOnThisDay;
  }

  return scheduledCount;
};

// SPEC 5.1: Calculate per-subject attendance percentage
export const calculatePerSubjectAttendance = (
  subjectCode: string | undefined,
  timetable: TimetableSlot[],
  attendance: AttendanceLog[],
  holidays: Holiday[],
  upToDate: string,
  semesterConfig?: SemesterConfig | null
): {
  total_sessions: number;
  attended_sessions: number;
  percentage: number;
} => {
  const upToDateObj = parseISO(upToDate);

  // Calculate total scheduled sessions from semester start to today
  const total = semesterConfig
    ? getScheduledSessionsUntilDate(subjectCode, timetable, semesterConfig, holidays, upToDate)
    : 0;

  // Get attendance logs for this subject up to the given date
  const attendanceForSubject = attendance.filter(
    (log) =>
      log.subject_code === subjectCode &&
      !isAfter(parseISO(log.date), upToDateObj)
  );

  // Count absent (leave) periods
  const absentCount = attendanceForSubject.filter((log) => log.status === 'leave').length;

  // Count OD periods (count as attended)
  const odCount = attendanceForSubject.filter((log) => log.status === 'od').length;

  // Attended = total scheduled - absent + od already counted in total
  // Actually: attended = (total - absent) because unmarked periods are present
  // But OD is also attended, so: attended = total - absent
  // Wait, let me think again:
  // - Total scheduled sessions from start to today
  // - Absent = explicitly marked as 'leave'
  // - OD = explicitly marked as 'od' (counts as present)
  // - Present = either explicitly marked OR unmarked (default present)
  // So: attended = total - absent
  const attended = total - absentCount;

  // SPEC 5.1: If TotalSessions = 0, attendance defaults to 100%
  const percentage = total === 0 ? 100 : Math.round((attended / total) * 100);

  return {
    total_sessions: total,
    attended_sessions: attended,
    percentage,
  };
};

// SPEC 5.2: Calculate overall attendance (flat average across all subjects)
export const calculateOverallAttendance = (
  subjectStats: Array<{
    percentage: number;
    total_sessions: number;
  }>
): number => {
  if (subjectStats.length === 0) return 100;

  const sum = subjectStats.reduce((acc, stat) => acc + stat.percentage, 0);
  return Math.round(sum / subjectStats.length);
};

// SPEC 5.3: Calculate OD periods used and remaining
export const calculateODHours = (
  attendance: AttendanceLog[],
  timetable: TimetableSlot[]
): {
  od_hours_used: number;
  od_hours_remaining: number;
} => {
  // Count periods marked as OD (not hours)
  const od_periods_used = attendance.filter((log) => log.status === 'od').length;

  const od_hours_remaining = Math.max(0, MAX_OD_HOURS - od_periods_used);

  return {
    od_hours_used: od_periods_used,
    od_hours_remaining: od_hours_remaining,
  };
};

// Determine status based on percentage (SPEC 7.1)
const getStatus = (
  percentage: number,
  isOverall: boolean
): 'safe' | 'warning' | 'danger' => {
  if (isOverall) {
    if (percentage >= OVERALL_WARNING) return 'safe';
    if (percentage >= OVERALL_MINIMUM) return 'warning';
    return 'danger';
  } else {
    if (percentage >= PER_SUBJECT_WARNING) return 'safe';
    if (percentage >= PER_SUBJECT_MINIMUM) return 'warning';
    return 'danger';
  }
};

// SPEC 5.4: Safe Margin Calculator
export const calculateSafeMargin = (
  subjectCode: string,
  timetable: TimetableSlot[],
  attendance: AttendanceLog[],
  holidays: Holiday[],
  semesterConfig: SemesterConfig
): {
  future_sessions: number;
  projected_total: number;
  min_required: number;
  must_attend: number;
  can_skip: number;
} => {
  const today = new Date();
  const lastInstruction = parseISO(semesterConfig.last_instruction_date);

  // Current attendance for subject
  const current = calculatePerSubjectAttendance(
    subjectCode,
    timetable,
    attendance,
    holidays,
    new Date().toISOString().split('T')[0],
    semesterConfig
  );

  // Get subject slots
  const subjectSlots = timetable.filter((slot) => slot.subject_code === subjectCode);

  // Count future sessions (rough estimate based on slots)
  // In production, this would use actual date generation
  let future_sessions = 0;

  // For now, estimate based on weekly pattern
  const daysRemaining = Math.ceil(
    (lastInstruction.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeksRemaining = Math.ceil(daysRemaining / 7);

  // Count unique periods per week for this subject
  const uniquePeriodsPerWeek = new Set(subjectSlots.map((s) => s.period_number)).size;
  future_sessions = uniquePeriodsPerWeek * weeksRemaining;

  const projected_total = current.total_sessions + future_sessions;
  const min_required = Math.ceil(projected_total * (PER_SUBJECT_MINIMUM / 100));
  const must_attend = Math.max(0, min_required - current.attended_sessions);
  const can_skip = Math.max(0, Math.floor(future_sessions - must_attend));

  return {
    future_sessions: Math.max(0, future_sessions),
    projected_total,
    min_required,
    must_attend,
    can_skip,
  };
};

// Calculate stats for a single subject
export const calculateSubjectStats = (
  subject: Subject,
  timetable: TimetableSlot[],
  attendance: AttendanceLog[],
  holidays: Holiday[],
  upToDate: string,
  semesterConfig?: SemesterConfig | null
): AttendanceStats => {
  const { total_sessions, attended_sessions, percentage } = calculatePerSubjectAttendance(
    subject.subject_code,
    timetable,
    attendance,
    holidays,
    upToDate,
    semesterConfig
  );

  const status = getStatus(percentage, false);

  return {
    subject_code: subject.subject_code,
    subject_name: subject.subject_name,
    credits: subject.credits,
    total_sessions,
    attended_sessions,
    percentage,
    status,
  };
};

// Calculate overall stats
export const calculateOverallStats = (
  subjects: Subject[],
  timetable: TimetableSlot[],
  attendance: AttendanceLog[],
  holidays: Holiday[],
  upToDate: string,
  semesterConfig?: SemesterConfig | null
): {
  overall_stats: OverallStats;
  subject_stats: AttendanceStats[];
} => {
  const subject_stats = subjects.map((subject) =>
    calculateSubjectStats(subject, timetable, attendance, holidays, upToDate, semesterConfig)
  );

  const overall_percentage = calculateOverallAttendance(
    subject_stats.map((s) => ({
      percentage: s.percentage,
      total_sessions: s.total_sessions,
    }))
  );

  const { od_hours_used, od_hours_remaining } = calculateODHours(attendance, timetable);

  const overall_stats: OverallStats = {
    total_sessions: subject_stats.reduce((sum, s) => sum + s.total_sessions, 0),
    attended_sessions: subject_stats.reduce((sum, s) => sum + s.attended_sessions, 0),
    percentage: overall_percentage,
    status: getStatus(overall_percentage, true),
    od_hours_used,
    od_hours_remaining,
  };

  return { overall_stats, subject_stats };
};
