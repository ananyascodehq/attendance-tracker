// Per-subject and overall attendance thresholds (SPEC Section 1)
export const PER_SUBJECT_MINIMUM = 75; // 75% per-subject minimum
export const OVERALL_MINIMUM = 80; // 80% overall minimum
export const PER_SUBJECT_WARNING = 77; // Warning threshold at 77%
export const OVERALL_WARNING = 82; // Warning threshold at 82%

// OD Limit (SPEC Section 1)
export const MAX_OD_HOURS = 72; // hours per semester

// Color coding thresholds (SPEC Section 7.1)
export const COLOR_THRESHOLDS = {
  overall: {
    safe: 82, // >= 82%
    warning: 80, // 80-82%
    danger: 0, // < 80%
  },
  perSubject: {
    safe: 77, // >= 77%
    warning: 75, // 75-77%
    danger: 0, // < 75%
  },
} as const;

// Periods and days
export const PERIODS = [1, 2, 3, 4, 5, 6, 7] as const;
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const STATUS_TAILWIND = {
  safe: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white',
} as const;

export const STORAGE_KEYS = {
  SUBJECTS: 'attendance_subjects',
  TIMETABLE: 'attendance_timetable',
  ATTENDANCE: 'attendance_logs',
  HOLIDAYS: 'attendance_holidays',
  SEMESTER_CONFIG: 'attendance_semester_config',
} as const;
