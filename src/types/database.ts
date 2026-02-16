// =============================================
// Supabase Database Types
// Generated from supabase/schema.sql
// =============================================

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type PeriodNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type AttendanceStatusDB = 'present' | 'leave' | 'od';
export type ZeroCreditTypeDB = 'library' | 'seminar' | 'vac';

// =============================================
// Department Types
// =============================================
export type Department =
  // Undergraduate Programs
  | 'B.E. Mechanical Engineering (Automobile)'
  | 'B.Tech Chemical Engineering'
  | 'B.E Civil Engineering'
  | 'B.E Computer Science and Engineering'
  | 'B.E Electrical and Electronics Engineering'
  | 'B.E Electronics and Communication Engineering'
  | 'B.E Marine Engineering'
  | 'B.E Mechanical Engineering'
  | 'B.Tech Biotechnology'
  | 'B.Tech Information Technology'
  | 'B.Tech Artificial Intelligence and Data Sciences'
  | 'B.E Mechanical and Automation Engineering'
  // Postgraduate Programs
  | 'M.E Communication Systems'
  | 'M.E Computer Science and Engineering'
  | 'M.E Power Electronics & Drives'
  | 'M.Tech Biotechnology'
  | 'M.Tech Chemical Engineering'
  | 'M.Tech Cyber Forensics and Information Security'
  | 'M.E Industrial Automation and Robotics'
  | 'M.E Construction Engineering and Management';

export const DEPARTMENTS: { category: string; departments: Department[] }[] = [
  {
    category: 'Undergraduate Programs',
    departments: [
      'B.E. Mechanical Engineering (Automobile)',
      'B.Tech Chemical Engineering',
      'B.E Civil Engineering',
      'B.E Computer Science and Engineering',
      'B.E Electrical and Electronics Engineering',
      'B.E Electronics and Communication Engineering',
      'B.E Marine Engineering',
      'B.E Mechanical Engineering',
      'B.Tech Biotechnology',
      'B.Tech Information Technology',
      'B.Tech Artificial Intelligence and Data Sciences',
      'B.E Mechanical and Automation Engineering',
    ],
  },
  {
    category: 'Postgraduate Programs',
    departments: [
      'M.E Communication Systems',
      'M.E Computer Science and Engineering',
      'M.E Power Electronics & Drives',
      'M.Tech Biotechnology',
      'M.Tech Chemical Engineering',
      'M.Tech Cyber Forensics and Information Security',
      'M.E Industrial Automation and Robotics',
      'M.E Construction Engineering and Management',
    ],
  },
];

// =============================================
// Profile Table
// =============================================
export interface Profile {
  id: string; // UUID, same as auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  department: Department | null;
  onboarded: boolean;
  created_at: string; // ISO timestamp
}

// =============================================
// Semester Table
// =============================================
export interface Semester {
  id: string; // UUID
  user_id: string;
  name: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  last_instruction_date: string | null; // ISO date
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SemesterInsert {
  name: string;
  start_date: string;
  end_date: string;
  last_instruction_date?: string | null;
  is_active?: boolean;
}

export interface SemesterUpdate {
  name?: string;
  start_date?: string;
  end_date?: string;
  last_instruction_date?: string | null;
  is_active?: boolean;
}

// =============================================
// Subject Table
// =============================================
export interface SubjectDB {
  id: string; // UUID
  user_id: string;
  semester_id: string;
  subject_code: string | null;
  subject_name: string;
  credits: number; // 0, 1.5, 2, 3, or 4
  zero_credit_type: ZeroCreditTypeDB | null;
  created_at: string;
  updated_at: string;
}

export interface SubjectInsert {
  semester_id: string;
  subject_code?: string | null;
  subject_name: string;
  credits: number;
  zero_credit_type?: ZeroCreditTypeDB | null;
}

export interface SubjectUpdate {
  subject_code?: string | null;
  subject_name?: string;
  credits?: number;
  zero_credit_type?: ZeroCreditTypeDB | null;
}

// =============================================
// Timetable Slot Table
// =============================================
export interface TimetableSlotDB {
  id: string; // UUID
  user_id: string;
  semester_id: string;
  subject_id: string | null;
  day_of_week: DayOfWeek;
  period_number: PeriodNumber;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  created_at: string;
}

export interface TimetableSlotInsert {
  semester_id: string;
  subject_id?: string | null;
  day_of_week: DayOfWeek;
  period_number: PeriodNumber;
  start_time: string;
  end_time: string;
}

export interface TimetableSlotUpdate {
  subject_id?: string | null;
  start_time?: string;
  end_time?: string;
}

// =============================================
// Attendance Log Table
// =============================================
export interface AttendanceLogDB {
  id: string; // UUID
  user_id: string;
  semester_id: string;
  subject_id: string;
  date: string; // ISO date
  period_number: PeriodNumber;
  status: AttendanceStatusDB;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLogInsert {
  semester_id: string;
  subject_id: string;
  date: string;
  period_number: PeriodNumber;
  status: AttendanceStatusDB;
  notes?: string | null;
}

export interface AttendanceLogUpdate {
  status?: AttendanceStatusDB;
  notes?: string | null;
}

// =============================================
// Holiday Table
// =============================================
export interface HolidayDB {
  id: string; // UUID
  user_id: string;
  semester_id: string;
  date: string; // ISO date
  description: string;
  created_at: string;
}

export interface HolidayInsert {
  semester_id: string;
  date: string;
  description: string;
}

export interface HolidayUpdate {
  date?: string;
  description?: string;
}

// =============================================
// CAT Period Table
// =============================================
export interface CatPeriodDB {
  id: string; // UUID
  user_id: string;
  semester_id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface CatPeriodInsert {
  semester_id: string;
  name: string;
  start_date: string;
  end_date: string;
}

export interface CatPeriodUpdate {
  name?: string;
  start_date?: string;
  end_date?: string;
}

// =============================================
// Joined Types (for queries with joins)
// =============================================
export interface TimetableSlotWithSubject extends TimetableSlotDB {
  subject: SubjectDB | null;
}

export interface AttendanceLogWithSubject extends AttendanceLogDB {
  subject: SubjectDB;
}

// =============================================
// Timetable Template Table (Phase 2: Viral Sharing)
// =============================================

// Slot structure stored in JSONB (simplified, no UUIDs needed)
export interface TemplateSlot {
  day_of_week: DayOfWeek;
  period_number: PeriodNumber;
  subject_code: string | null;
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}

// Subject structure stored in JSONB
export interface TemplateSubject {
  subject_code: string | null;
  subject_name: string;
  credits: number;
  zero_credit_type: ZeroCreditTypeDB | null;
}

export interface TimetableTemplate {
  id: string; // UUID
  share_code: string;
  department: string;
  year: number;
  semester: number;
  section: string | null;
  created_by: string | null; // UUID, null if creator deleted account
  use_count: number;
  slots: TemplateSlot[];
  subjects: TemplateSubject[];
  created_at: string;
  updated_at: string;
}

export interface TimetableTemplateInsert {
  share_code: string;
  department: string;
  year: number;
  semester: number;
  section?: string | null;
  slots: TemplateSlot[];
  subjects: TemplateSubject[];
}

export interface TimetableTemplateUpdate {
  share_code?: string;
  slots?: TemplateSlot[];
  subjects?: TemplateSubject[];
}

// Department abbreviation mapping for share codes
export const DEPARTMENT_ABBREVIATIONS: Record<string, string> = {
  'B.E. Mechanical Engineering (Automobile)': 'MEA',
  'B.Tech Chemical Engineering': 'CH',
  'B.E Civil Engineering': 'CE',
  'B.E Computer Science and Engineering': 'CS',
  'B.E Electrical and Electronics Engineering': 'EE',
  'B.E Electronics and Communication Engineering': 'EC',
  'B.E Marine Engineering': 'MR',
  'B.E Mechanical Engineering': 'ME',
  'B.Tech Biotechnology': 'BT',
  'B.Tech Information Technology': 'IT',
  'B.Tech Artificial Intelligence and Data Sciences': 'AI',
  'B.E Mechanical and Automation Engineering': 'MA',
  'M.E Communication Systems': 'MCS',
  'M.E Computer Science and Engineering': 'MCE',
  'M.E Power Electronics & Drives': 'MPE',
  'M.Tech Biotechnology': 'MBT',
  'M.Tech Chemical Engineering': 'MCH',
  'M.Tech Cyber Forensics and Information Security': 'MCF',
  'M.E Industrial Automation and Robotics': 'MIA',
  'M.E Construction Engineering and Management': 'MCM',
};

// =============================================
// Full Semester Data (for dashboard)
// =============================================
export interface SemesterData {
  semester: Semester;
  subjects: SubjectDB[];
  timetable: TimetableSlotDB[];
  attendance: AttendanceLogDB[];
  holidays: HolidayDB[];
  cat_periods: CatPeriodDB[];
}
