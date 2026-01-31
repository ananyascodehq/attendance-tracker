export interface Subject {
  subject_code: string;
  subject_name: string;
  credits: 3 | 4;
}

export interface TimetableSlot {
  id: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_code: string;
  start_time: string;
  end_time: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'od';

export interface AttendanceLog {
  id: string;
  date: string;
  period_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  subject_code: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface Holiday {
  date: string;
  description: string;
}

export type ODApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ODLog {
  id: string;
  date: string;
  hours_used: number;
  reason: string;
  approval_status: ODApprovalStatus;
}

export interface AppData {
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendance: AttendanceLog[];
  holidays: Holiday[];
  od_logs: ODLog[];
  semester_end_date: string;
}

export interface AttendanceStats {
  subject_code: string;
  subject_name: string;
  credits: 3 | 4;
  total_classes: number;
  present: number;
  absent: number;
  od: number;
  percentage: number;
  status: 'safe' | 'caution' | 'danger';
}

export interface OverallStats {
  total_classes: number;
  present: number;
  absent: number;
  od: number;
  percentage: number;
  status: 'safe' | 'caution' | 'danger';
}
