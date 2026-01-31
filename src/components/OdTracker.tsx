'use client';

import { useAttendanceData } from '@/hooks/useAttendanceData';

export const OdTracker = () => {
  const { data, getODHours } = useAttendanceData();

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-900">Please set up your timetable first.</p>
      </div>
    );
  }

  const { od_hours_used, od_hours_remaining } = getODHours();
  const percentage = (od_hours_used / 72) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">OD Hours Tracker</h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-700">Total OD Used</span>
            <span className="text-3xl font-bold text-gray-900">{od_hours_used}</span>
          </div>
          <div className="text-xs text-gray-600 mb-2">out of 72 hours per semester</div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${
                percentage < 70
                  ? 'bg-green-500'
                  : percentage < 90
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-600">Used: {od_hours_used}h</p>
            <p className="text-xs text-gray-600">Remaining: {od_hours_remaining}h</p>
            <p className="text-xs text-gray-600">{Math.round(percentage)}%</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-green-700 font-semibold mb-1">USED</p>
            <p className="text-2xl font-bold text-green-900">{od_hours_used}h</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-1">REMAINING</p>
            <p className="text-2xl font-bold text-blue-900">{od_hours_remaining}h</p>
          </div>
        </div>

        {/* Status Message */}
        {od_hours_used > 72 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-900 font-semibold text-sm">⚠️ OD Limit Exceeded</p>
            <p className="text-red-800 text-xs mt-1">
              You have exceeded the 72-hour limit by {(od_hours_used - 72).toFixed(1)} hours.
            </p>
          </div>
        )}

        {od_hours_remaining < 10 && od_hours_used <= 72 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-900 font-semibold text-sm">ℹ️ Low OD Balance</p>
            <p className="text-yellow-800 text-xs mt-1">
              Only {od_hours_remaining.toFixed(1)} hours remaining.
            </p>
          </div>
        )}

        {od_hours_used === 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 font-semibold text-sm">💡 Tip</p>
            <p className="text-blue-800 text-xs mt-1">
              Mark attendance as "OD" for official duties. OD hours count as present and are tracked
              here.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-700">
        <p className="font-semibold mb-2">📌 About OD Hours:</p>
        <ul className="space-y-1">
          <li>• You have <strong>72 hours</strong> total per semester</li>
          <li>• OD is <strong>auto-approved</strong> (no pending status)</li>
          <li>• OD counts as <strong>present</strong> for attendance</li>
          <li>• Limit is <strong>informational only</strong> (no blocking)</li>
        </ul>
      </div>
    </div>
  );
};
