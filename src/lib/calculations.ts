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
import { parseISO, isBefore, isAfter, isSameDay, eachDayOfInterval, getDay } from 'date-fns';

// SPEC 2.3: Check if a date is a holiday
export const isHoliday = (date: string, holidays: Holiday[]): boolean => {
  return holidays.some((h) => h.date === date);
};

// SPEC 5.1: Calculate per-subject attendance percentage
export const calculatePerSubjectAttendance = (
  subjectCode: string,
  timetable: TimetableSlot[],
  attendance: AttendanceLog[],
  holidays: Holiday[],
  upToDate: string
): {
  total_sessions: number;
  attended_sessions: number;
  percentage: number;
} => {
  const upToDateObj = parseISO(upToDate);

  // Get all slots for this subject
  const subjectSlots = timetable.filter((slot) => slot.subject_code === subjectCode);

  // Count total sessions: we need actual dates, so we calculate based on the pattern
  // For now, we count attendance logs as the actual sessions held
  const attendanceForSubject = attendance.filter(
    (log) =>
      log.subject_code === subjectCode &&
      !isAfter(parseISO(log.date), upToDateObj)
  );

  // SPEC 5.1: Attended sessions count as 'present' OR 'od'
  const attended = attendanceForSubject.filter((log) =>
    log.status === 'present' || log.status === 'od'
  ).length;

  // Total sessions includes all logged sessions
  const total = attendanceForSubject.length;

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

// SPEC 5.3: Calculate OD hours used and remaining
export const calculateODHours = (
  attendance: AttendanceLog[],
  timetable: TimetableSlot[]
): {
  od_hours_used: number;
  od_hours_remaining: number;
} => {
  let od_hours_used = 0;

  // Sum hours for all sessions marked as 'od'
  attendance.forEach((log) => {
    if (log.status === 'od') {
      const slot = timetable.find(
        (s) =>
          s.subject_code === log.subject_code &&
          s.period_number === log.period_number
      );
      // SPEC 5.3: Missing slot duration defaults to 1.0 hour
      const duration = slot ? slot.duration_hours || 1.0 : 1.0;
      od_hours_used += duration;
    }
  });

  const od_hours_remaining = Math.max(0, MAX_OD_HOURS - od_hours_used);

  return {
    od_hours_used: Math.round(od_hours_used * 10) / 10,
    od_hours_remaining: Math.round(od_hours_remaining * 10) / 10,
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
    new Date().toISOString().split('T')[0]
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
  upToDate: string
): AttendanceStats => {
  const { total_sessions, attended_sessions, percentage } = calculatePerSubjectAttendance(
    subject.subject_code,
    timetable,
    attendance,
    holidays,
    upToDate
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
  upToDate: string
): {
  overall_stats: OverallStats;
  subject_stats: AttendanceStats[];
} => {
  const subject_stats = subjects.map((subject) =>
    calculateSubjectStats(subject, timetable, attendance, holidays, upToDate)
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
