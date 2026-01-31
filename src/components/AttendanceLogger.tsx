'use client';

import { useState } from 'react';
import { AttendanceLog, TimetableSlot, AttendanceStatus } from '@/types';

interface AttendanceLoggerProps {
  date: string;
  slots: TimetableSlot[];
  logs: AttendanceLog[];
  onSave: (logs: AttendanceLog[]) => void;
}

export const AttendanceLogger = ({ date, slots, logs, onSave }: AttendanceLoggerProps) => {
  const [tempLogs, setTempLogs] = useState<Map<string, AttendanceStatus>>(
    new Map(logs.map((log) => [log.period_number.toString(), log.status]))
  );

  const handleStatusChange = (periodNumber: number, status: AttendanceStatus) => {
    const key = periodNumber.toString();
    if (tempLogs.get(key) === status) {
      tempLogs.delete(key);
    } else {
      tempLogs.set(key, status);
    }
    setTempLogs(new Map(tempLogs));
  };

  const handleSave = () => {
    const newLogs: AttendanceLog[] = Array.from(tempLogs.entries()).map(([period, status]) => ({
      id: `${date}-${period}`,
      date,
      period_number: parseInt(period) as any,
      subject_code: slots.find((s) => s.period_number === parseInt(period))?.subject_code || '',
      status,
    }));
    onSave(newLogs);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Log Attendance for {date}</h2>
      <div className="space-y-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="font-medium">Period {slot.period_number}</p>
              <p className="text-sm text-gray-600">{slot.subject_code}</p>
              <p className="text-xs text-gray-500">
                {slot.start_time} - {slot.end_time}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange(slot.period_number, 'present')}
                className={`px-3 py-1 rounded-md ${
                  tempLogs.get(slot.period_number.toString()) === 'present'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                P
              </button>
              <button
                onClick={() => handleStatusChange(slot.period_number, 'absent')}
                className={`px-3 py-1 rounded-md ${
                  tempLogs.get(slot.period_number.toString()) === 'absent'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                A
              </button>
              <button
                onClick={() => handleStatusChange(slot.period_number, 'od')}
                className={`px-3 py-1 rounded-md ${
                  tempLogs.get(slot.period_number.toString()) === 'od'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                OD
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Save Attendance
      </button>
    </div>
  );
};
