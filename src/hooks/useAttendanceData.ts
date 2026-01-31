'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppData,
  Subject,
  TimetableSlot,
  AttendanceLog,
  Holiday,
  SemesterConfig,
} from '@/types';
import { loadAppData, saveAppData } from '@/lib/storage';
import {
  calculateOverallStats,
  calculateSafeMargin,
  calculateODHours,
} from '@/lib/calculations';

export const useAttendanceData = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedData = loadAppData();
    setData(loadedData);
    setLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (data && !loading) {
      saveAppData(data);
    }
  }, [data, loading]);

  // Add a new attendance log
  const addAttendanceLog = useCallback(
    (log: Omit<AttendanceLog, 'id'>) => {
      if (!data) return;
      const newLog: AttendanceLog = {
        ...log,
        id: `${log.date}-${log.period_number}-${log.subject_code}`,
      };
      setData({
        ...data,
        attendance: [
          ...data.attendance.filter(
            (l) =>
              !(
                l.date === log.date &&
                l.period_number === log.period_number &&
                l.subject_code === log.subject_code
              )
          ),
          newLog,
        ],
      });
    },
    [data]
  );

  // Delete an attendance log
  const deleteAttendanceLog = useCallback(
    (date: string, period: number, subjectCode: string) => {
      if (!data) return;
      setData({
        ...data,
        attendance: data.attendance.filter(
          (l) =>
            !(l.date === date && l.period_number === period && l.subject_code === subjectCode)
        ),
      });
    },
    [data]
  );

  // Bulk mark full day as leave
  const markDayAsLeave = useCallback(
    (date: string, subjects: string[]) => {
      if (!data) return;
      const logsToAdd: AttendanceLog[] = subjects.map((subjectCode) => ({
        id: `${date}-full-${subjectCode}`,
        date,
        period_number: 1 as const,
        subject_code: subjectCode,
        status: 'leave' as const,
      }));

      setData({
        ...data,
        attendance: [
          ...data.attendance.filter((l) => l.date !== date),
          ...logsToAdd,
        ],
      });
    },
    [data]
  );

  // Get today's date in ISO format
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  // Calculate overall and per-subject stats
  const getStats = useCallback(
    (upToDate?: string) => {
      if (!data) return null;
      const targetDate = upToDate || getTodayISO();
      return calculateOverallStats(
        data.subjects,
        data.timetable,
        data.attendance,
        data.holidays,
        targetDate
      );
    },
    [data]
  );

  // Get OD hours
  const getODHours = useCallback(() => {
    if (!data) return { od_hours_used: 0, od_hours_remaining: 72 };
    return calculateODHours(data.attendance, data.timetable);
  }, [data]);

  // Get safe margin for a subject
  const getSafeMargin = useCallback(
    (subjectCode: string) => {
      if (!data || !data.semester_config.last_instruction_date) return null;
      return calculateSafeMargin(
        subjectCode,
        data.timetable,
        data.attendance,
        data.holidays,
        data.semester_config
      );
    },
    [data]
  );

  // Simulate leave impact
  const simulateLeaveImpact = useCallback(
    (startDate: string, endDate: string, subjectCodes: string[]) => {
      if (!data) return null;

      // Create a temporary attendance array with simulated leave
      const simulatedAttendance = [...data.attendance];

      // Add leave entries for each day and subject in range
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        for (const subjectCode of subjectCodes) {
          // Only add if not already marked with other status
          if (
            !simulatedAttendance.find(
              (l) => l.date === dateStr && l.subject_code === subjectCode
            )
          ) {
            simulatedAttendance.push({
              id: `sim-${dateStr}-${subjectCode}`,
              date: dateStr,
              period_number: 1,
              subject_code: subjectCode,
              status: 'leave',
            });
          }
        }
      }

      // Calculate stats with simulated data
      return calculateOverallStats(
        data.subjects,
        data.timetable,
        simulatedAttendance,
        data.holidays,
        new Date().toISOString().split('T')[0]
      );
    },
    [data]
  );

  // Get subjects with timetable
  const getSubjectsWithSlots = useCallback(() => {
    if (!data) return [];
    return data.subjects.map((subject) => ({
      subject,
      slots: data.timetable.filter((slot) => slot.subject_code === subject.subject_code),
    }));
  }, [data]);

  // Add/update subject
  const updateSubject = useCallback(
    (subject: Subject) => {
      if (!data) return;
      setData({
        ...data,
        subjects: data.subjects.find((s) => s.subject_code === subject.subject_code)
          ? data.subjects.map((s) => (s.subject_code === subject.subject_code ? subject : s))
          : [...data.subjects, subject],
      });
    },
    [data]
  );

  // Add/update timetable slot
  const updateTimetableSlot = useCallback(
    (slot: TimetableSlot) => {
      if (!data) return;
      setData({
        ...data,
        timetable: data.timetable.find((s) => s.id === slot.id)
          ? data.timetable.map((s) => (s.id === slot.id ? slot : s))
          : [...data.timetable, slot],
      });
    },
    [data]
  );

  // Add holiday
  const addHoliday = useCallback(
    (holiday: Holiday) => {
      if (!data) return;
      setData({
        ...data,
        holidays: data.holidays.find((h) => h.date === holiday.date)
          ? data.holidays.map((h) => (h.date === holiday.date ? holiday : h))
          : [...data.holidays, holiday],
      });
    },
    [data]
  );

  // Update semester config
  const updateSemesterConfig = useCallback(
    (config: SemesterConfig) => {
      if (!data) return;
      setData({
        ...data,
        semester_config: config,
      });
    },
    [data]
  );

  // Bulk update subjects
  const updateAllSubjects = useCallback(
    (subjects: Subject[]) => {
      if (!data) return;
      setData({
        ...data,
        subjects,
      });
    },
    [data]
  );

  // Bulk update timetable
  const updateAllTimetable = useCallback(
    (timetable: TimetableSlot[]) => {
      if (!data) return;
      setData({
        ...data,
        timetable,
      });
    },
    [data]
  );

  // Bulk update holidays
  const updateAllHolidays = useCallback(
    (holidays: Holiday[]) => {
      if (!data) return;
      setData({
        ...data,
        holidays,
      });
    },
    [data]
  );

  // Clear all data
  const clearAllData = useCallback(() => {
    setData({
      subjects: [],
      timetable: [],
      attendance: [],
      holidays: [],
      semester_config: {
        start_date: '',
        end_date: '',
        last_instruction_date: '',
      },
    });
  }, []);

  return {
    // Data
    data,
    loading,
    getTodayISO,

    // Calculations
    getStats,
    getODHours,
    getSafeMargin,
    simulateLeaveImpact,
    getSubjectsWithSlots,

    // Mutations
    addAttendanceLog,
    deleteAttendanceLog,
    markDayAsLeave,
    updateSubject,
    updateTimetableSlot,
    addHoliday,
    updateSemesterConfig,
    updateAllSubjects,
    updateAllTimetable,
    updateAllHolidays,
    clearAllData,
  };
};
