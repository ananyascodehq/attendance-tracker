import { createClient } from '@/lib/supabase/client';
import type {
  Semester,
  SemesterInsert,
  SemesterUpdate,
  SubjectDB,
  SubjectInsert,
  SubjectUpdate,
  TimetableSlotDB,
  TimetableSlotInsert,
  TimetableSlotUpdate,
  AttendanceLogDB,
  AttendanceLogInsert,
  AttendanceLogUpdate,
  HolidayDB,
  HolidayInsert,
  HolidayUpdate,
  CatPeriodDB,
  CatPeriodInsert,
  CatPeriodUpdate,
  SemesterData,
} from '@/types/database';

const supabase = createClient();

// Helper: get authenticated user ID (required for all inserts)
async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

// =============================================
// SEMESTER OPERATIONS
// =============================================

export async function getSemesters(): Promise<Semester[]> {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getActiveSemester(): Promise<Semester | null> {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function createSemester(semester: SemesterInsert): Promise<Semester> {
  const userId = await getUserId();

  // First deactivate all other semesters if this one is active
  if (semester.is_active !== false) {
    await supabase
      .from('semesters')
      .update({ is_active: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('semesters')
    .insert({ ...semester, user_id: userId, is_active: semester.is_active ?? true })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSemester(id: string, updates: SemesterUpdate): Promise<Semester> {
  // If setting active, deactivate others first
  if (updates.is_active === true) {
    const userId = await getUserId();
    await supabase
      .from('semesters')
      .update({ is_active: false })
      .eq('user_id', userId)
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('semesters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSemester(id: string): Promise<void> {
  const { error } = await supabase
    .from('semesters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// SUBJECT OPERATIONS
// =============================================

export async function getSubjects(semesterId: string): Promise<SubjectDB[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('semester_id', semesterId)
    .order('subject_name');

  if (error) throw error;
  return data || [];
}

export async function createSubject(subject: SubjectInsert): Promise<SubjectDB> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('subjects')
    .insert({ ...subject, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubject(id: string, updates: SubjectUpdate): Promise<SubjectDB> {
  const { data, error } = await supabase
    .from('subjects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// TIMETABLE OPERATIONS
// =============================================

export async function getTimetable(semesterId: string): Promise<TimetableSlotDB[]> {
  const { data, error } = await supabase
    .from('timetable_slots')
    .select('*')
    .eq('semester_id', semesterId)
    .order('day_of_week')
    .order('period_number');

  if (error) throw error;
  return data || [];
}

export async function upsertTimetableSlot(slot: TimetableSlotInsert): Promise<TimetableSlotDB> {
  const userId = await getUserId();

  // Check if slot exists
  const { data: existing } = await supabase
    .from('timetable_slots')
    .select('id')
    .eq('semester_id', slot.semester_id)
    .eq('day_of_week', slot.day_of_week)
    .eq('period_number', slot.period_number)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('timetable_slots')
      .update({
        subject_id: slot.subject_id,
        start_time: slot.start_time,
        end_time: slot.end_time,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('timetable_slots')
      .insert({ ...slot, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function deleteTimetableSlot(id: string): Promise<void> {
  const { error } = await supabase
    .from('timetable_slots')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function clearTimetable(semesterId: string): Promise<void> {
  const { error } = await supabase
    .from('timetable_slots')
    .delete()
    .eq('semester_id', semesterId);

  if (error) throw error;
}

// =============================================
// ATTENDANCE OPERATIONS
// =============================================

export async function getAttendance(semesterId: string): Promise<AttendanceLogDB[]> {
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('semester_id', semesterId)
    .order('date', { ascending: false })
    .order('period_number');

  if (error) throw error;
  return data || [];
}

export async function getAttendanceByDateRange(
  semesterId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceLogDB[]> {
  const { data, error } = await supabase
    .from('attendance_logs')
    .select('*')
    .eq('semester_id', semesterId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('period_number');

  if (error) throw error;
  return data || [];
}

export async function logAttendance(log: AttendanceLogInsert): Promise<AttendanceLogDB> {
  const userId = await getUserId();

  // Check if log exists for this subject/date/period
  const { data: existing } = await supabase
    .from('attendance_logs')
    .select('id')
    .eq('semester_id', log.semester_id)
    .eq('subject_id', log.subject_id)
    .eq('date', log.date)
    .eq('period_number', log.period_number)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        status: log.status,
        notes: log.notes,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({ ...log, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export async function deleteAttendanceLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('attendance_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// HOLIDAY OPERATIONS
// =============================================

export async function getHolidays(semesterId: string): Promise<HolidayDB[]> {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('semester_id', semesterId)
    .order('date');

  if (error) throw error;
  return data || [];
}

export async function addHoliday(holiday: HolidayInsert): Promise<HolidayDB> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('holidays')
    .insert({ ...holiday, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHoliday(id: string, updates: HolidayUpdate): Promise<HolidayDB> {
  const { data, error } = await supabase
    .from('holidays')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHoliday(id: string): Promise<void> {
  const { error } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// CAT PERIOD OPERATIONS
// =============================================

export async function getCatPeriods(semesterId: string): Promise<CatPeriodDB[]> {
  const { data, error } = await supabase
    .from('cat_periods')
    .select('*')
    .eq('semester_id', semesterId)
    .order('start_date');

  if (error) throw error;
  return data || [];
}

export async function addCatPeriod(period: CatPeriodInsert): Promise<CatPeriodDB> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('cat_periods')
    .insert({ ...period, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCatPeriod(id: string, updates: CatPeriodUpdate): Promise<CatPeriodDB> {
  const { data, error } = await supabase
    .from('cat_periods')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCatPeriod(id: string): Promise<void> {
  const { error } = await supabase
    .from('cat_periods')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// =============================================
// FULL SEMESTER DATA
// =============================================

export async function getSemesterData(semesterId: string): Promise<SemesterData | null> {
  const { data: semester, error: semesterError } = await supabase
    .from('semesters')
    .select('*')
    .eq('id', semesterId)
    .single();

  if (semesterError) {
    if (semesterError.code === 'PGRST116') return null;
    throw semesterError;
  }

  // Fetch all related data in parallel
  const [subjects, timetable, attendance, holidays, cat_periods] = await Promise.all([
    getSubjects(semesterId),
    getTimetable(semesterId),
    getAttendance(semesterId),
    getHolidays(semesterId),
    getCatPeriods(semesterId),
  ]);

  return {
    semester,
    subjects,
    timetable,
    attendance,
    holidays,
    cat_periods,
  };
}

export async function getActiveSemesterData(): Promise<SemesterData | null> {
  const activeSemester = await getActiveSemester();
  if (!activeSemester) return null;
  return getSemesterData(activeSemester.id);
}
