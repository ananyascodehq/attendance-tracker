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
// For labs (3 consecutive periods), counts as 1 session per day
// For VAC (2 consecutive periods), counts as 1 session per day
export const getScheduledSessionsUntilDate = (
  subjectCode: string | undefined,
  timetable: TimetableSlot[],
  semesterConfig: SemesterConfig | null,
  holidays: Holiday[],
  upToDate: string,
  subjects?: Subject[]
): number => {
  if (!semesterConfig) return 0;

  const startDate = parseISO(semesterConfig.start_date);
  const endDate = parseISO(upToDate);

  // If end date is before start date, return 0
  if (isBefore(endDate, startDate)) return 0;

  // Get all slots for this subject
  const subjectSlots = timetable.filter((slot) => slot.subject_code === subjectCode);

  if (subjectSlots.length === 0) return 0;

  // Check if this is a lab or VAC (multi-period = 1 session)
  const subject = subjects?.find(s => s.subject_code === subjectCode || s.subject_name === subjectCode);
  const isLab = subject ? (subject.credits === 1.5 || subject.subject_name.toLowerCase().includes('lab')) : false;
  const isVAC = subject?.zero_credit_type === 'vac';
  const isMultiPeriodSession = isLab || isVAC;

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

    // Count sessions on this day
    const slotsOnThisDay = subjectSlots.filter((slot) => slot.day_of_week === dayName);
    
    if (isMultiPeriodSession) {
      // For labs/VAC: count as 1 session if there are any periods on this day
      // (All 3 lab periods or 2 VAC periods count as 1 session)
      if (slotsOnThisDay.length > 0) {
        scheduledCount += 1;
      }
    } else {
      // For regular classes: each period is a separate session
      scheduledCount += slotsOnThisDay.length;
    }
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
  semesterConfig?: SemesterConfig | null,
  subjects?: Subject[]
): {
  total_sessions: number;
  attended_sessions: number;
  present_count: number;
  absent_count: number;
  od_count: number;
  percentage: number;
} => {
  const upToDateObj = parseISO(upToDate);

  // Calculate total scheduled sessions from semester start to today
  const total = semesterConfig
    ? getScheduledSessionsUntilDate(subjectCode, timetable, semesterConfig, holidays, upToDate, subjects)
    : 0;

  // Get attendance logs for this subject up to the given date
  const attendanceForSubject = attendance.filter(
    (log) =>
      log.subject_code === subjectCode &&
      !isAfter(parseISO(log.date), upToDateObj)
  );

  // Check if this is a lab or VAC (multi-period = 1 session)
  const subject = subjects?.find(s => s.subject_code === subjectCode || s.subject_name === subjectCode);
  const isLab = subject ? (subject.credits === 1.5 || subject.subject_name.toLowerCase().includes('lab')) : false;
  const isVAC = subject?.zero_credit_type === 'vac';
  const isMultiPeriodSession = isLab || isVAC;

  let absentCount: number;
  let odCount: number;

  if (isMultiPeriodSession) {
    // For labs/VAC: count unique DATES with leave/od status (not individual periods)
    // If any period on a day is marked absent, the whole lab session is absent
    const absentDates = new Set(
      attendanceForSubject.filter((log) => log.status === 'leave').map(log => log.date)
    );
    const odDates = new Set(
      attendanceForSubject.filter((log) => log.status === 'od').map(log => log.date)
    );
    absentCount = absentDates.size;
    odCount = odDates.size;
  } else {
    // For regular classes: count each period separately
    absentCount = attendanceForSubject.filter((log) => log.status === 'leave').length;
    odCount = attendanceForSubject.filter((log) => log.status === 'od').length;
  }

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
  
  // Present count = attended minus OD (since OD is tracked separately but also counts as attended)
  const presentCount = attended - odCount;

  // SPEC 5.1: If TotalSessions = 0, attendance defaults to 100%
  const percentage = total === 0 ? 100 : Math.round((attended / total) * 100);

  return {
    total_sessions: total,
    attended_sessions: attended,
    present_count: presentCount,
    absent_count: absentCount,
    od_count: odCount,
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
  semesterConfig: SemesterConfig,
  subjects?: Subject[]
): {
  future_sessions: number;
  projected_total: number;
  min_required: number;
  must_attend: number;
  can_skip: number;
} => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Current attendance for subject (sessions up to today)
  const current = calculatePerSubjectAttendance(
    subjectCode,
    timetable,
    attendance,
    holidays,
    todayStr,
    semesterConfig,
    subjects
  );

  // Get TOTAL scheduled sessions from semester start to semester end
  // This uses the actual timetable, holidays, and CAT periods
  const totalScheduledSessions = getScheduledSessionsUntilDate(
    subjectCode,
    timetable,
    semesterConfig,
    holidays,
    semesterConfig.end_date,
    subjects
  );

  // Future sessions = Total scheduled - Sessions up to today
  // This accurately accounts for:
  // - Actual timetable (which days & how many periods per day)
  // - All holidays
  // - CAT exam periods
  // - Sundays
  const future_sessions = Math.max(0, totalScheduledSessions - current.total_sessions);

  const projected_total = current.total_sessions + future_sessions;
  const min_required = Math.ceil(projected_total * (PER_SUBJECT_MINIMUM / 100));
  const must_attend = Math.max(0, min_required - current.attended_sessions);
  const can_skip = Math.max(0, Math.floor(future_sessions - must_attend));

  return {
    future_sessions,
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
  semesterConfig?: SemesterConfig | null,
  subjects?: Subject[]
): AttendanceStats => {
  const { total_sessions, attended_sessions, present_count, absent_count, od_count, percentage } = calculatePerSubjectAttendance(
    subject.subject_code,
    timetable,
    attendance,
    holidays,
    upToDate,
    semesterConfig,
    subjects
  );

  const status = getStatus(percentage, false);

  return {
    subject_code: subject.subject_code,
    subject_name: subject.subject_name,
    credits: subject.credits,
    total_sessions,
    attended_sessions,
    present_count,
    absent_count,
    od_count,
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
    calculateSubjectStats(subject, timetable, attendance, holidays, upToDate, semesterConfig, subjects)
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
