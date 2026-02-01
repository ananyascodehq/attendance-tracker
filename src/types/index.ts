export type ZeroCreditType = 'library' | 'seminar' | 'vac';

export interface Subject {
  subject_code?: string;
  subject_name: string;
  credits: 0 | 1.5 | 2 | 3 | 4;
  zero_credit_type?: ZeroCreditType; // For 0-credit courses: 'library', 'seminar', or 'vac'
}

export interface TimetableSlot {
  id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_code?: string;
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  duration_hours?: number; // Optional, defaults to 1.0 if missing per spec
}

export type AttendanceStatus = 'present' | 'od' | 'leave';

export interface AttendanceLog {
  id: string;
  date: string;
  period_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_code?: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface CATExamPeriod {
  id: string;
  name: string; // e.g., "CAT 1", "CAT 2"
  start_date: string; // ISO date
  end_date: string; // ISO date
}

export interface SemesterConfig {
  start_date: string; // ISO date
  end_date: string; // ISO date
  last_instruction_date: string; // ISO date
  cat_periods?: CATExamPeriod[]; // CAT exam periods
}

export interface Holiday {
  date: string;
  description: string;
}

export type ODApprovalStatus = 'approved'; // All ODs auto-approved per spec

export interface ODLog {
  id: string;
  date: string;
  period_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_code?: string;
  hours_used: number;
  reason?: string;
  approval_status: ODApprovalStatus;
}

export interface AppData {
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendance: AttendanceLog[];
  holidays: Holiday[];
  semester_config: SemesterConfig;
}

export interface AttendanceStats {
  subject_code?: string;
  subject_name: string;
  credits: 0 | 1.5 | 3 | 4;
  total_sessions: number;
  attended_sessions: number;
  present_count: number;
  absent_count: number;
  od_count: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface OverallStats {
  total_sessions: number;
  attended_sessions: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
  od_hours_used: number;
  od_hours_remaining: number;
}
