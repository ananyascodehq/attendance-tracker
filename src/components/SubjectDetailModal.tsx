'use client';

import { useMemo } from 'react';
import { TimetableSlot, AttendanceLog, Holiday, SemesterConfig, AttendanceStats } from '@/types';
import { eachDayOfInterval, parseISO, format, getDay } from 'date-fns';

// Map day index to day name
const dayIndexToName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

interface ClassRecord {
  date: string;
  dayName: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  status: 'present' | 'absent' | 'od';
}

interface SubjectDetailModalProps {
  stats: AttendanceStats;
  timetable: TimetableSlot[];
  attendance: AttendanceLog[];
  holidays: Holiday[];
  semesterConfig: SemesterConfig;
  onClose: () => void;
}

export const SubjectDetailModal = ({
  stats,
  timetable,
  attendance,
  holidays,
  semesterConfig,
  onClose,
}: SubjectDetailModalProps) => {
  // Check if a date falls within any CAT exam period
  const isInCATExamPeriod = (dateStr: string): boolean => {
    if (!semesterConfig?.cat_periods) return false;
    
    const date = parseISO(dateStr);
    
    for (const cat of semesterConfig.cat_periods) {
      const catStart = parseISO(cat.start_date);
      const catEnd = parseISO(cat.end_date);
      
      // date >= catStart && date <= catEnd
      if (date >= catStart && date <= catEnd) {
        return true;
      }
    }
    
    return false;
  };

  // Calculate all class records for this subject
  const classRecords = useMemo((): ClassRecord[] => {
    const records: ClassRecord[] = [];

    const startDate = parseISO(semesterConfig.start_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get holiday dates for quick lookup
    const holidayDates = new Set(holidays.map((h) => h.date));

    // Get all slots for this subject
    const subjectSlots = timetable.filter(
      (slot) => slot.subject_code === stats.subject_code
    );

    if (subjectSlots.length === 0) return records;

    // Get all days from semester start to today
    try {
      const allDays = eachDayOfInterval({ start: startDate, end: today });

      for (const day of allDays) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayName = dayIndexToName(getDay(day));

        // Skip Sundays, holidays, and CAT exam periods
        if (dayName === 'Sunday' || holidayDates.has(dateStr) || isInCATExamPeriod(dateStr)) continue;

        // Find slots for this day
        const slotsForDay = subjectSlots.filter((slot) => slot.day_of_week === dayName);

        for (const slot of slotsForDay) {
          // Check attendance log for this specific period
          const log = attendance.find(
            (l) =>
              l.date === dateStr &&
              l.period_number === slot.period_number &&
              l.subject_code === stats.subject_code
          );

          let status: 'present' | 'absent' | 'od' = 'present'; // Default is present
          if (log) {
            if (log.status === 'leave') {
              status = 'absent';
            } else if (log.status === 'od') {
              status = 'od';
            }
          }

          records.push({
            date: dateStr,
            dayName,
            periodNumber: slot.period_number,
            startTime: slot.start_time,
            endTime: slot.end_time,
            status,
          });
        }
      }
    } catch {
      // Handle date parsing errors
    }

    // Sort by date ascending (oldest first)
    return records.sort((a, b) => a.date.localeCompare(b.date));
  }, [stats.subject_code, timetable, attendance, holidays, semesterConfig]);

  // Count statuses
  const statusCounts = useMemo(() => {
    const counts = { present: 0, absent: 0, od: 0 };
    classRecords.forEach((record) => {
      counts[record.status]++;
    });
    return counts;
  }, [classRecords]);

  const statusConfig = {
    present: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-300',
      border: 'border-green-300 dark:border-green-700',
      icon: '✓',
      label: 'Present',
    },
    absent: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-300',
      border: 'border-red-300 dark:border-red-700',
      icon: '✗',
      label: 'Absent',
    },
    od: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-800 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-700',
      icon: '⚡',
      label: 'OD',
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.subject_name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{stats.subject_code || 'No code'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.percentage}%</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">Attendance</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{statusCounts.present}</p>
              <p className="text-xs text-green-600 dark:text-green-300">Present</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">{statusCounts.absent}</p>
              <p className="text-xs text-red-600 dark:text-red-300">Absent</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{statusCounts.od}</p>
              <p className="text-xs text-purple-600 dark:text-purple-300">OD</p>
            </div>
          </div>
        </div>

        {/* Class Records List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            All Classes ({classRecords.length} total)
          </h3>

          {classRecords.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No classes recorded yet</p>
          ) : (
            <div className="space-y-2">
              {classRecords.map((record, index) => {
                const config = statusConfig[record.status];
                return (
                  <div
                    key={`${record.date}-${record.periodNumber}-${index}`}
                    className={`flex items-center justify-between p-3 rounded-lg border ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[80px]">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {format(parseISO(record.date), 'MMM d')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{record.dayName}</p>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Period {record.periodNumber}</span>
                        <span className="mx-2">•</span>
                        <span>{record.startTime} - {record.endTime}</span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.text} font-medium`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
