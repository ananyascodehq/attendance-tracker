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
      setData((prevData) => {
        if (!prevData) return prevData;
        // Use subject_code if available, else use subject_name
        const subjectIdentifier = log.subject_code || 
          prevData.subjects.find(s => s.subject_code === log.subject_code)?.subject_name || 
          log.subject_code;
        const newLog: AttendanceLog = {
          ...log,
          id: `${log.date}-${log.period_number}-${subjectIdentifier}`,
        };
        return {
          ...prevData,
          attendance: [
            ...prevData.attendance.filter(
              (l) =>
                !(
                  l.date === log.date &&
                  l.period_number === log.period_number &&
                  l.subject_code === log.subject_code
                )
            ),
            newLog,
          ],
        };
      });
    },
    []
  );

  // Delete an attendance log
  const deleteAttendanceLog = useCallback(
    (date: string, period: number, subjectCode: string | undefined) => {
      setData((prevData) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          attendance: prevData.attendance.filter(
            (l) =>
              !(l.date === date && l.period_number === period && l.subject_code === subjectCode)
          ),
        };
      });
    },
    []
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
        targetDate,
        data.semester_config
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

      // Map day index to day name
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Get holiday dates for quick lookup
      const holidayDates = new Set(data.holidays.map((h) => h.date));

      // Helper to check if date is in CAT exam period
      const isInCATExamPeriod = (dateStr: string): boolean => {
        if (!data.semester_config?.cat_periods) return false;
        const date = new Date(dateStr);
        for (const cat of data.semester_config.cat_periods) {
          const catStart = new Date(cat.start_date);
          const catEnd = new Date(cat.end_date);
          if (date >= catStart && date <= catEnd) {
            return true;
          }
        }
        return false;
      };

      // Add leave entries for each ACTUAL SCHEDULED PERIOD in the date range
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];

        // Skip Sundays, holidays, and CAT exam periods
        if (dayName === 'Sunday' || holidayDates.has(dateStr) || isInCATExamPeriod(dateStr)) continue;

        // Find all timetable slots for this day that match the selected subjects
        const slotsForDay = data.timetable.filter(
          (slot) => slot.day_of_week === dayName && subjectCodes.includes(slot.subject_code || '')
        );

        // Add a leave entry for each scheduled period
        for (const slot of slotsForDay) {
          const existingLog = simulatedAttendance.find(
            (l) => l.date === dateStr && l.period_number === slot.period_number && l.subject_code === slot.subject_code
          );

          // Only add if not already logged
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

      // Calculate stats with simulated data
      return calculateOverallStats(
        data.subjects,
        data.timetable,
        simulatedAttendance,
        data.holidays,
        new Date().toISOString().split('T')[0],
        data.semester_config
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
