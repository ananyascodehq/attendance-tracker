'use client';

import { useState } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { AttendanceLogger } from '@/components/AttendanceLogger';
import { format } from 'date-fns';

export default function AttendancePage() {
  const { data, updateData, isLoading } = useAttendanceData();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center">No data found</div>;
  }

  const todaysTimetable = data.timetable; // In production, filter by day of week

  const handleSaveAttendance = (logs: any[]) => {
    const updatedAttendance = [
      ...data.attendance.filter((log) => log.date !== selectedDate),
      ...logs,
    ];

    updateData({
      ...data,
      attendance: updatedAttendance,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Log Attendance</h1>
        <p className="text-gray-600">Mark your attendance for today</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2"
        />
      </div>

      {todaysTimetable.length > 0 ? (
        <AttendanceLogger
          date={selectedDate}
          slots={todaysTimetable}
          logs={data.attendance.filter((log) => log.date === selectedDate)}
          onSave={handleSaveAttendance}
        />
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-900">
            No classes scheduled for today. Please set up your timetable first.
          </p>
        </div>
      )}
    </div>
  );
}
