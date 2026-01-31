'use client';

import { useState, useMemo } from 'react';
import { TimetableSlot, AttendanceStatus } from '@/types';

interface AttendanceLoggerProps {
  date: string;
  timetable: TimetableSlot[];
  onLogAttendance: (period: number, subject: string | undefined, status: AttendanceStatus) => void;
  onDeleteAttendance: (period: number, subject: string | undefined) => void;
  existingLogs: Map<string, AttendanceStatus>; // key: "period-subject"
  onSave?: () => void;
}

export const AttendanceLogger = ({
  date,
  timetable,
  onLogAttendance,
  onDeleteAttendance,
  existingLogs,
  onSave,
}: AttendanceLoggerProps) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

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

  const handleStatusClick = (period: number, subject: string | undefined, status: AttendanceStatus) => {
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

  const handleMarkDayAsAbsent = () => {
    // Mark ALL periods as leave, not just one per subject
    todaySlots.forEach((slot) => {
      onLogAttendance(slot.period_number, slot.subject_code, 'leave');
    });
  };

  const handleMarkDayAsOD = () => {
    // Mark ALL periods as OD
    todaySlots.forEach((slot) => {
      onLogAttendance(slot.period_number, slot.subject_code, 'od');
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
        <div className="flex gap-2">
          <button
            onClick={handleMarkDayAsAbsent}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
            disabled={todaySlots.length === 0}
          >
            Full Day Absent
          </button>
          <button
            onClick={handleMarkDayAsOD}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
            disabled={todaySlots.length === 0}
          >
            Full Day OD
          </button>
          <button
            onClick={() => {
              setIsSaving(true);
              setTimeout(() => {
                onSave?.();
                setIsSaving(false);
                setShowSaved(true);
                setTimeout(() => setShowSaved(false), 2000);
              }, 500);
            }}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg font-medium transition-all min-w-[100px] flex items-center justify-center gap-2 ${
              showSaved
                ? 'bg-green-500 text-white'
                : isSaving
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : showSaved ? (
              '✓ Saved!'
            ) : (
              '💾 Save'
            )}
          </button>
        </div>
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
                        handleStatusClick(slot.period_number, slot.subject_code, 'leave')
                      }
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentStatus === 'leave'
                          ? 'bg-yellow-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                      }`}
                      title="Mark as Absent"
                    >
                      ✗ Absent
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
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        title="Reset to Present (default)"
                      >
                        ✓ Reset
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
          <li>✓ <strong>Default:</strong> All periods are counted as Present unless marked otherwise.</li>
          <li>✗ <strong>Absent:</strong> Counts against your attendance calculation.</li>
          <li>⚡ <strong>OD:</strong> On-duty (auto-approved). Counts as present for attendance.</li>
          <li>↩ <strong>Reset:</strong> Clears the mark and returns to default Present state.</li>
        </ul>
      </div>
    </div>
  );
};
