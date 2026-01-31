'use client';

import { useState, useMemo } from 'react';
import { TimetableSlot, AttendanceStatus } from '@/types';

interface AttendanceLoggerProps {
  date: string;
  timetable: TimetableSlot[];
  onLogAttendance: (period: number, subject: string, status: AttendanceStatus) => void;
  onDeleteAttendance: (period: number, subject: string) => void;
  existingLogs: Map<string, AttendanceStatus>; // key: "period-subject"
}

export const AttendanceLogger = ({
  date,
  timetable,
  onLogAttendance,
  onDeleteAttendance,
  existingLogs,
}: AttendanceLoggerProps) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null);

  // Get day name for the date
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

  // Get slots for this day
  const todaySlots = useMemo(
    () =>
      timetable
        .filter((slot) => slot.day_of_week === dayName)
        .sort((a, b) => a.period_number - b.period_number),
    [timetable, dayName]
  );

  const handleStatusClick = (period: number, subject: string, status: AttendanceStatus) => {
    const key = `${period}-${subject}`;
    const current = existingLogs.get(key);

    // Toggle off if clicking same status
    if (current === status) {
      onDeleteAttendance(period, subject);
      setSelectedStatus(null);
    } else {
      onLogAttendance(period, subject, status);
      setSelectedStatus(status);
    }
  };

  const handleMarkDayAsLeave = () => {
    const subjects = Array.from(new Set(todaySlots.map((s) => s.subject_code)));
    subjects.forEach((subject) => {
      const slot = todaySlots.find((s) => s.subject_code === subject);
      if (slot) {
        onLogAttendance(slot.period_number, subject, 'leave');
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Log Attendance</h2>
          <p className="text-gray-600 mt-1">
            {date} ({dayName})
          </p>
        </div>
        <button
          onClick={handleMarkDayAsLeave}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
          disabled={todaySlots.length === 0}
        >
          Mark Full Day as Leave
        </button>
      </div>

      {todaySlots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No classes scheduled for {dayName}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todaySlots.map((slot) => {
            const logKey = `${slot.period_number}-${slot.subject_code}`;
            const currentStatus = existingLogs.get(logKey);

            return (
              <div
                key={slot.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Period {slot.period_number}
                      </span>
                      <span className="text-gray-600">{slot.start_time} - {slot.end_time}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{slot.subject_code}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleStatusClick(slot.period_number, slot.subject_code, 'present')
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentStatus === 'present'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                      }`}
                      title="Mark as Present (default)"
                    >
                      ✓ Present
                    </button>

                    <button
                      onClick={() =>
                        handleStatusClick(slot.period_number, slot.subject_code, 'leave')
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentStatus === 'leave'
                          ? 'bg-yellow-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                      }`}
                      title="Mark as Leave"
                    >
                      ✗ Leave
                    </button>

                    <button
                      onClick={() =>
                        handleStatusClick(slot.period_number, slot.subject_code, 'od')
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentStatus === 'od'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                      }`}
                      title="Mark as On-Duty (auto-approved)"
                    >
                      ⚡ OD
                    </button>

                    {currentStatus && (
                      <button
                        onClick={() =>
                          onDeleteAttendance(slot.period_number, slot.subject_code)
                        }
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        title="Clear mark"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-2">How it works:</p>
        <ul className="space-y-1 text-xs">
          <li>✓ <strong>Present:</strong> Default state. Only mark if you need to deviate.</li>
          <li>✗ <strong>Leave:</strong> Counts as absent for attendance calculation.</li>
          <li>⚡ <strong>OD:</strong> On-duty (auto-approved). Counts as present for attendance.</li>
        </ul>
      </div>
    </div>
  );
};
