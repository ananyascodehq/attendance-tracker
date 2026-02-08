'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import * as db from '@/lib/supabase/database';
import type {
  SemesterData,
  Semester,
  SubjectDB,
  TimetableSlotDB,
  AttendanceLogDB,
  HolidayDB,
  CatPeriodDB,
  SubjectInsert,
  TimetableSlotInsert,
  AttendanceLogInsert,
  HolidayInsert,
  CatPeriodInsert,
  DayOfWeek,
  PeriodNumber,
  AttendanceStatusDB,
} from '@/types/database';
import type {
  Subject,
  TimetableSlot,
  AttendanceLog,
  Holiday,
  SemesterConfig,
  AppData,
} from '@/types';
import {
  calculateOverallStats,
  calculateSafeMargin,
  calculateODHours,
} from '@/lib/calculations';

// =============================================
// CONVERSION UTILITIES
// Convert between DB types and legacy App types
// =============================================

function subjectDBToLegacy(s: SubjectDB): Subject {
  return {
    subject_code: s.subject_code || undefined,
    subject_name: s.subject_name,
    credits: s.credits as 0 | 1.5 | 2 | 3 | 4,
    zero_credit_type: s.zero_credit_type as 'library' | 'seminar' | 'vac' | undefined,
  };
}

function timetableDBToLegacy(t: TimetableSlotDB, subjects: SubjectDB[]): TimetableSlot {
  const subject = subjects.find(s => s.id === t.subject_id);
  return {
    id: t.id,
    day_of_week: t.day_of_week as TimetableSlot['day_of_week'],
    period_number: t.period_number as TimetableSlot['period_number'],
    subject_code: subject?.subject_code || undefined,
    start_time: t.start_time.slice(0, 5), // Remove seconds
    end_time: t.end_time.slice(0, 5),
  };
}

function attendanceDBToLegacy(a: AttendanceLogDB, subjects: SubjectDB[]): AttendanceLog {
  const subject = subjects.find(s => s.id === a.subject_id);
  return {
    id: a.id,
    date: a.date,
    period_number: a.period_number as AttendanceLog['period_number'],
    subject_code: subject?.subject_code || undefined,
    status: a.status as AttendanceLog['status'],
    notes: a.notes || undefined,
  };
}

function holidayDBToLegacy(h: HolidayDB): Holiday {
  return {
    date: h.date,
    description: h.description,
  };
}

function semesterToConfig(s: Semester, catPeriods: CatPeriodDB[]): SemesterConfig {
  return {
    start_date: s.start_date,
    end_date: s.end_date,
    last_instruction_date: s.last_instruction_date || s.end_date,
    cat_periods: catPeriods.map(c => ({
      id: c.id,
      name: c.name,
      start_date: c.start_date,
      end_date: c.end_date,
    })),
  };
}

// Convert SemesterData to legacy AppData format
function semesterDataToAppData(data: SemesterData): AppData {
  return {
    subjects: data.subjects.map(subjectDBToLegacy),
    timetable: data.timetable.map(t => timetableDBToLegacy(t, data.subjects)),
    attendance: data.attendance.map(a => attendanceDBToLegacy(a, data.subjects)),
    holidays: data.holidays.map(holidayDBToLegacy),
    semester_config: semesterToConfig(data.semester, data.cat_periods),
  };
}

// =============================================
// MAIN HOOK
// =============================================

interface UseSyncedDataResult {
  // Legacy data format for backwards compatibility
  data: AppData | null;
  loading: boolean;
  error: Error | null;

  // Semester management
  semesters: Semester[];
  activeSemester: Semester | null;
  semesterData: SemesterData | null;
  setActiveSemester: (semesterId: string) => Promise<void>;
  createSemester: (name: string, startDate: string, endDate: string, lastInstructionDate?: string) => Promise<Semester>;

  // Legacy API for calculations
  getTodayISO: () => string;
  getStats: (upToDate?: string) => ReturnType<typeof calculateOverallStats> | null;
  getODHours: () => { od_hours_used: number; od_hours_remaining: number };
  getSafeMargin: (subjectCode: string) => ReturnType<typeof calculateSafeMargin> | null;
  simulateLeaveImpact: (startDate: string, endDate: string, subjectCodes: string[]) => ReturnType<typeof calculateOverallStats> | null;
  getSubjectsWithSlots: () => { subject: Subject; slots: TimetableSlot[] }[];

  // CRUD operations (write to Supabase)
  addAttendanceLog: (log: Omit<AttendanceLog, 'id'>) => Promise<void>;
  deleteAttendanceLog: (date: string, period: number, subjectCode: string | undefined) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (subjectCode: string) => Promise<void>;
  updateTimetableSlot: (slot: TimetableSlot) => Promise<void>;
  deleteTimetableSlot: (slotId: string) => Promise<void>;
  addHoliday: (holiday: Holiday) => Promise<void>;
  deleteHoliday: (date: string) => Promise<void>;
  updateSemesterConfig: (config: SemesterConfig) => Promise<void>;
  updateAllSubjects: (subjects: Subject[]) => Promise<void>;
  updateAllTimetable: (timetable: TimetableSlot[]) => Promise<void>;
  updateAllHolidays: (holidays: Holiday[]) => Promise<void>;
  clearAllData: () => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

export function useSyncedData(): UseSyncedDataResult {
  const { user } = useAuth();
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Cache for subject lookups
  const subjectMapRef = useRef<Map<string, SubjectDB>>(new Map());

  // Load all data (showLoading: false for background refreshes after mutations)
  const loadData = useCallback(async (showLoading = true) => {
    if (!user) {
      setSemesterData(null);
      setSemesters([]);
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const [allSemesters, activeData] = await Promise.all([
        db.getSemesters(),
        db.getActiveSemesterData(),
      ]);

      setSemesters(allSemesters);
      setSemesterData(activeData);

      // Build subject lookup map (by code, or by zero_credit_type for library/seminar)
      if (activeData) {
        const map = new Map<string, SubjectDB>();
        activeData.subjects.forEach(s => {
          if (s.subject_code) {
            map.set(s.subject_code, s);
          } else if (s.zero_credit_type === 'library' || s.zero_credit_type === 'seminar') {
            // Use __library__ or __seminar__ as key for subjects without code
            map.set(`__${s.zero_credit_type}__`, s);
          }
        });
        subjectMapRef.current = map;
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user || !semesterData?.semester?.id) return;

    const supabase = createClient();
    const semesterId = semesterData.semester.id;

    const channel = supabase
      .channel(`semester-${semesterId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects', filter: `semester_id=eq.${semesterId}` }, () => loadData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'timetable_slots', filter: `semester_id=eq.${semesterId}` }, () => loadData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs', filter: `semester_id=eq.${semesterId}` }, () => loadData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'holidays', filter: `semester_id=eq.${semesterId}` }, () => loadData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cat_periods', filter: `semester_id=eq.${semesterId}` }, () => loadData(false))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, semesterData?.semester?.id, loadData]);

  // Convert to legacy format
  const data: AppData | null = semesterData ? semesterDataToAppData(semesterData) : null;
  const activeSemester = semesterData?.semester || null;

  // =============================================
  // SEMESTER OPERATIONS
  // =============================================

  const setActiveSemester = useCallback(async (semesterId: string) => {
    try {
      await db.updateSemester(semesterId, { is_active: true });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch semester'));
    }
  }, [loadData]);

  const createSemester = useCallback(async (
    name: string,
    startDate: string,
    endDate: string,
    lastInstructionDate?: string
  ): Promise<Semester> => {
    const semester = await db.createSemester({
      name,
      start_date: startDate,
      end_date: endDate,
      last_instruction_date: lastInstructionDate || null,
      is_active: true,
    });
    await loadData();
    return semester;
  }, [loadData]);

  // =============================================
  // LEGACY CALCULATION API
  // =============================================

  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const getStats = useCallback((upToDate?: string) => {
    if (!data) return null;
    return calculateOverallStats(
      data.subjects,
      data.timetable,
      data.attendance,
      data.holidays,
      upToDate || getTodayISO(),
      data.semester_config
    );
  }, [data]);

  const getODHours = useCallback(() => {
    if (!data) return { od_hours_used: 0, od_hours_remaining: 72 };
    return calculateODHours(data.attendance, data.timetable);
  }, [data]);

  const getSafeMargin = useCallback((subjectCode: string) => {
    if (!data || !data.semester_config.end_date) return null;
    return calculateSafeMargin(
      subjectCode,
      data.timetable,
      data.attendance,
      data.holidays,
      data.semester_config,
      data.subjects
    );
  }, [data]);

  const simulateLeaveImpact = useCallback((startDate: string, endDate: string, subjectCodes: string[]) => {
    if (!data) return null;

    const simulatedAttendance = [...data.attendance];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const holidayDates = new Set(data.holidays.map(h => h.date));

    const isInCATExamPeriod = (dateStr: string): boolean => {
      if (!data.semester_config?.cat_periods) return false;
      const date = new Date(dateStr);
      for (const cat of data.semester_config.cat_periods) {
        const catStart = new Date(cat.start_date);
        const catEnd = new Date(cat.end_date);
        if (date >= catStart && date <= catEnd) return true;
      }
      return false;
    };

    const leaveStart = new Date(startDate);
    const leaveEnd = new Date(endDate);

    for (let date = new Date(leaveStart); date <= leaveEnd; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];

      if (dayName === 'Sunday' || holidayDates.has(dateStr) || isInCATExamPeriod(dateStr)) continue;

      const slotsForDay = data.timetable.filter(
        slot => slot.day_of_week === dayName && subjectCodes.includes(slot.subject_code || '')
      );

      for (const slot of slotsForDay) {
        const existingLog = simulatedAttendance.find(
          l => l.date === dateStr && l.period_number === slot.period_number && l.subject_code === slot.subject_code
        );

        if (!existingLog) {
          simulatedAttendance.push({
            id: `sim-${dateStr}-${slot.period_number}-${slot.subject_code}`,
            date: dateStr,
            period_number: slot.period_number,
            subject_code: slot.subject_code,
            status: 'leave',
          });
        }
      }
    }

    return calculateOverallStats(
      data.subjects,
      data.timetable,
      simulatedAttendance,
      data.holidays,
      endDate,
      data.semester_config
    );
  }, [data]);

  const getSubjectsWithSlots = useCallback(() => {
    if (!data) return [];
    return data.subjects.map(subject => ({
      subject,
      slots: data.timetable.filter(slot => slot.subject_code === subject.subject_code),
    }));
  }, [data]);

  // =============================================
  // CRUD OPERATIONS (Write to Supabase)
  // =============================================

  const addAttendanceLog = useCallback(async (log: Omit<AttendanceLog, 'id'>) => {
    if (!semesterData) return;

    const subject = subjectMapRef.current.get(log.subject_code || '');
    if (!subject) {
      console.error('Subject not found:', log.subject_code);
      return;
    }

    await db.logAttendance({
      semester_id: semesterData.semester.id,
      subject_id: subject.id,
      date: log.date,
      period_number: log.period_number as PeriodNumber,
      status: log.status as AttendanceStatusDB,
      notes: log.notes || null,
    });
  }, [semesterData]);

  const deleteAttendanceLog = useCallback(async (date: string, period: number, subjectCode: string | undefined) => {
    if (!semesterData) return;

    const subject = subjectMapRef.current.get(subjectCode || '');
    if (!subject) return;

    const log = semesterData.attendance.find(
      a => a.date === date && a.period_number === period && a.subject_id === subject.id
    );
    if (log) {
      await db.deleteAttendanceLog(log.id);
    }
  }, [semesterData]);

  const updateSubject = useCallback(async (subject: Subject) => {
    if (!semesterData) return;

    const existing = subjectMapRef.current.get(subject.subject_code || '');
    if (existing) {
      await db.updateSubject(existing.id, {
        subject_code: subject.subject_code || null,
        subject_name: subject.subject_name,
        credits: subject.credits,
        zero_credit_type: subject.zero_credit_type || null,
      });
    } else {
      await db.createSubject({
        semester_id: semesterData.semester.id,
        subject_code: subject.subject_code || null,
        subject_name: subject.subject_name,
        credits: subject.credits,
        zero_credit_type: subject.zero_credit_type || null,
      });
    }
  }, [semesterData]);

  const deleteSubject = useCallback(async (subjectCode: string) => {
    const subject = subjectMapRef.current.get(subjectCode);
    if (subject) {
      await db.deleteSubject(subject.id);
    }
  }, []);

  const updateTimetableSlot = useCallback(async (slot: TimetableSlot) => {
    if (!semesterData) return;

    const subject = subjectMapRef.current.get(slot.subject_code || '');

    await db.upsertTimetableSlot({
      semester_id: semesterData.semester.id,
      subject_id: subject?.id || null,
      day_of_week: slot.day_of_week as DayOfWeek,
      period_number: slot.period_number as PeriodNumber,
      start_time: slot.start_time + ':00',
      end_time: slot.end_time + ':00',
    });
  }, [semesterData]);

  const deleteTimetableSlot = useCallback(async (slotId: string) => {
    await db.deleteTimetableSlot(slotId);
  }, []);

  const addHoliday = useCallback(async (holiday: Holiday) => {
    if (!semesterData) return;

    const existing = semesterData.holidays.find(h => h.date === holiday.date);
    if (existing) {
      await db.updateHoliday(existing.id, { description: holiday.description });
    } else {
      await db.addHoliday({
        semester_id: semesterData.semester.id,
        date: holiday.date,
        description: holiday.description,
      });
    }
  }, [semesterData]);

  const deleteHoliday = useCallback(async (date: string) => {
    if (!semesterData) return;
    const holiday = semesterData.holidays.find(h => h.date === date);
    if (holiday) {
      await db.deleteHoliday(holiday.id);
    }
  }, [semesterData]);

  const updateSemesterConfig = useCallback(async (config: SemesterConfig) => {
    if (!semesterData) return;

    // Update semester dates
    await db.updateSemester(semesterData.semester.id, {
      start_date: config.start_date,
      end_date: config.end_date,
      last_instruction_date: config.last_instruction_date || null,
    });

    // Sync CAT periods
    const existingIds = new Set(semesterData.cat_periods.map(c => c.id));
    const newIds = new Set((config.cat_periods || []).map(c => c.id));

    // Delete removed CAT periods
    for (const existing of semesterData.cat_periods) {
      if (!newIds.has(existing.id)) {
        await db.deleteCatPeriod(existing.id);
      }
    }

    // Add/update CAT periods
    for (const cat of config.cat_periods || []) {
      if (existingIds.has(cat.id)) {
        await db.updateCatPeriod(cat.id, {
          name: cat.name,
          start_date: cat.start_date,
          end_date: cat.end_date,
        });
      } else {
        await db.addCatPeriod({
          semester_id: semesterData.semester.id,
          name: cat.name,
          start_date: cat.start_date,
          end_date: cat.end_date,
        });
      }
    }
  }, [semesterData]);

  const updateAllSubjects = useCallback(async (subjects: Subject[]) => {
    if (!semesterData) return;

    // Helper to get unique key for a subject
    const getSubjectKey = (s: { subject_code?: string | null; zero_credit_type?: string | null }): string | null => {
      if (s.subject_code) return s.subject_code;
      if (s.zero_credit_type === 'library' || s.zero_credit_type === 'seminar') {
        return `__${s.zero_credit_type}__`;
      }
      return null;
    };

    const newKeys = new Set(subjects.map(s => getSubjectKey(s)).filter(Boolean));

    // Delete removed subjects (including library/seminar)
    for (const existing of semesterData.subjects) {
      const existingKey = getSubjectKey(existing);
      if (existingKey && !newKeys.has(existingKey)) {
        await db.deleteSubject(existing.id);
      }
    }

    // Add/update subjects
    for (const subject of subjects) {
      const subjectKey = getSubjectKey(subject);
      const existing = subjectKey ? subjectMapRef.current.get(subjectKey) : null;
      
      if (existing) {
        await db.updateSubject(existing.id, {
          subject_code: subject.subject_code || null,
          subject_name: subject.subject_name,
          credits: subject.credits,
          zero_credit_type: subject.zero_credit_type || null,
        });
      } else {
        await db.createSubject({
          semester_id: semesterData.semester.id,
          subject_code: subject.subject_code || null,
          subject_name: subject.subject_name,
          credits: subject.credits,
          zero_credit_type: subject.zero_credit_type || null,
        });
      }
    }

    await loadData(false);
  }, [semesterData, loadData]);

  const updateAllTimetable = useCallback(async (timetable: TimetableSlot[]) => {
    if (!semesterData) return;

    // Clear existing timetable
    await db.clearTimetable(semesterData.semester.id);

    // Reload subjects to get fresh IDs
    const subjects = await db.getSubjects(semesterData.semester.id);
    const subjectMap = new Map<string, SubjectDB>();
    subjects.forEach(s => {
      if (s.subject_code) subjectMap.set(s.subject_code, s);
    });

    // Add all slots
    for (const slot of timetable) {
      const subject = subjectMap.get(slot.subject_code || '');
      await db.upsertTimetableSlot({
        semester_id: semesterData.semester.id,
        subject_id: subject?.id || null,
        day_of_week: slot.day_of_week as DayOfWeek,
        period_number: slot.period_number as PeriodNumber,
        start_time: slot.start_time + ':00',
        end_time: slot.end_time + ':00',
      });
    }

    await loadData(false);
  }, [semesterData, loadData]);

  const updateAllHolidays = useCallback(async (holidays: Holiday[]) => {
    if (!semesterData) return;

    const existingDates = new Set(semesterData.holidays.map(h => h.date));
    const newDates = new Set(holidays.map(h => h.date));

    // Delete removed holidays
    for (const existing of semesterData.holidays) {
      if (!newDates.has(existing.date)) {
        await db.deleteHoliday(existing.id);
      }
    }

    // Add/update holidays
    for (const holiday of holidays) {
      const existing = semesterData.holidays.find(h => h.date === holiday.date);
      if (existing) {
        await db.updateHoliday(existing.id, { description: holiday.description });
      } else {
        await db.addHoliday({
          semester_id: semesterData.semester.id,
          date: holiday.date,
          description: holiday.description,
        });
      }
    }

    await loadData(false);
  }, [semesterData, loadData]);

  const clearAllData = useCallback(async () => {
    if (!semesterData) return;
    await db.deleteSemester(semesterData.semester.id);
    await loadData();
  }, [semesterData, loadData]);

  return {
    data,
    loading,
    error,
    semesters,
    activeSemester,
    semesterData,
    setActiveSemester,
    createSemester,
    getTodayISO,
    getStats,
    getODHours,
    getSafeMargin,
    simulateLeaveImpact,
    getSubjectsWithSlots,
    addAttendanceLog,
    deleteAttendanceLog,
    updateSubject,
    deleteSubject,
    updateTimetableSlot,
    deleteTimetableSlot,
    addHoliday,
    deleteHoliday,
    updateSemesterConfig,
    updateAllSubjects,
    updateAllTimetable,
    updateAllHolidays,
    clearAllData,
    refresh: loadData,
  };
}
