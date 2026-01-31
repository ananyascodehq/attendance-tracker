export const ATTENDANCE_THRESHOLD = 75;
export const MIN_ATTENDANCE_PERCENTAGE = 75;
export const MAX_OD_HOURS = 72;

export const PERIODS = [1, 2, 3, 4, 5, 6, 7] as const;
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

export const STATUS_COLORS = {
  safe: '#10b981',
  caution: '#f59e0b',
  danger: '#ef4444',
} as const;

export const STATUS_TAILWIND = {
  safe: 'bg-green-500 text-white',
  caution: 'bg-yellow-500 text-white',
  danger: 'bg-red-500 text-white',
} as const;

export const STORAGE_KEYS = {
  SUBJECTS: 'attendance_subjects',
  TIMETABLE: 'attendance_timetable',
  ATTENDANCE: 'attendance_logs',
  HOLIDAYS: 'attendance_holidays',
  OD_LOGS: 'attendance_od_logs',
  SEMESTER_END_DATE: 'attendance_semester_end_date',
} as const;
