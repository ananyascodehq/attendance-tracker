'use client';

import { useState, useMemo } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { AttendanceLogger } from '@/components/AttendanceLogger';

export default function AttendancePage() {
  const { data, loading, getTodayISO, addAttendanceLog, deleteAttendanceLog, markDayAsLeave } =
    useAttendanceData();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());

  // Create a map of existing logs for quick lookup - MUST be before early returns
  const logsMap = useMemo(() => {
    if (!data) return new Map();
    const map = new Map<string, any>();
    data.attendance
      .filter((log) => log.date === selectedDate)
      .forEach((log) => {
        map.set(`${log.period_number}-${log.subject_code}`, log.status);
      });
    return map;
  }, [data, selectedDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!data || data.subjects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Setup Data Found</h2>
            <p className="text-gray-600 mb-6">Please set up your timetable first.</p>
            <a
              href="/planner"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Go to Setup
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleLogAttendance = (period: number, subject: string, status: any) => {
    addAttendanceLog({
      date: selectedDate,
      period_number: period as any,
      subject_code: subject,
      status,
    });
  };

  const handleDeleteAttendance = (period: number, subject: string) => {
    deleteAttendanceLog(selectedDate, period, subject);
  };

  const handleMarkDayAsLeave = () => {
    const subjects = data.subjects.map((s) => s.subject_code);
    markDayAsLeave(selectedDate, subjects);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Log Attendance</h1>
          <p className="text-gray-600 mt-2">Mark attendance for any day</p>
        </div>

        {/* Date Picker */}
        <div className="bg-white rounded-lg shadow p-6">
          <label htmlFor="dateInput" className="block text-sm font-medium text-gray-700 mb-3">
            Select Date
          </label>
          <div className="flex gap-3">
            <input
              id="dateInput"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setSelectedDate(getTodayISO())}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Today
            </button>
          </div>
        </div>

        {/* Attendance Logger */}
        <AttendanceLogger
          date={selectedDate}
          timetable={data.timetable}
          onLogAttendance={handleLogAttendance}
          onDeleteAttendance={handleDeleteAttendance}
          existingLogs={logsMap}
        />

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Pro Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Default state is <strong>Present</strong> — only mark deviations</li>
            <li>• Use <strong>Leave</strong> for absences (counts against attendance)</li>
            <li>• Use <strong>OD</strong> for official duties (counts as present)</li>
            <li>• Changes save automatically to your local storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
