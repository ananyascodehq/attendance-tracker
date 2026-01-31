'use client';

import { useState } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';

// Icons
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ClipboardListIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

export const OdTracker = () => {
  const { data, getODHours } = useAttendanceData();
  const [showDetails, setShowDetails] = useState(false);

  if (!data) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
        <p className="text-yellow-900 dark:text-yellow-200">Please set up your timetable first.</p>
      </div>
    );
  }

  const { od_hours_used, od_hours_remaining } = getODHours();
  const percentage = (od_hours_used / 72) * 100;

  // Get all OD logs with details
  const odLogs = data.attendance
    .filter(log => log.status === 'od')
    .map(log => {
      const subject = data.subjects.find(s => s.subject_code === log.subject_code || s.subject_name === log.subject_code);
      const date = new Date(log.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      return {
        date: log.date,
        dayName,
        subjectName: subject?.subject_name || log.subject_code || 'Unknown',
        subjectCode: subject?.subject_code || '',
        period: log.period_number,
        reason: log.notes || '—',
      };
    })
    .sort((a, b) => {
      // Primary sort: by date (most recent first)
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      // Secondary sort: by period number (ascending)
      return a.period - b.period;
    });

  // Group by date
  const odLogsByDate = odLogs.reduce((acc, log) => {
    if (!acc[log.date]) {
      acc[log.date] = [];
    }
    acc[log.date].push(log);
    return acc;
  }, {} as Record<string, typeof odLogs>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">OD Hours Tracker</h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Total OD Used</span>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{od_hours_used}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">out of 72 hours per semester</div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
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
            <p className="text-xs text-gray-600 dark:text-gray-400">Used: {od_hours_used}h</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Remaining: {od_hours_remaining}h</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{Math.round(percentage)}%</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-700">
            <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">USED</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{od_hours_used}h</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">REMAINING</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{od_hours_remaining}h</p>
          </div>
        </div>

        {/* View Details Button */}
        {odLogs.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <EyeIcon className="w-5 h-5" />
                <span className="font-semibold">View Details</span>
                <span className="text-sm text-indigo-500 dark:text-indigo-400">({odLogs.length} entries)</span>
              </div>
              {showDetails ? (
                <ChevronUpIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {/* OD Details Table */}
            {showDetails && (
              <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ClipboardListIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">OD History</h3>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Day</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Subject</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Period</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {odLogs.map((log, index) => (
                        <tr key={`${log.date}-${log.period}-${log.subjectCode}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                            {new Date(log.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{log.dayName}</td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">{log.subjectName}</span>
                              {log.subjectCode && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({log.subjectCode})</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-200">Period {log.period}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 italic">
                            {log.reason === '—' ? (
                              <span className="text-gray-400 dark:text-gray-500">No reason specified</span>
                            ) : (
                              log.reason
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {odLogs.length === 0 && (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    No OD entries yet.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status Message */}
        {od_hours_used > 72 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-900 dark:text-red-100 font-semibold text-sm">⚠️ OD Limit Exceeded</p>
            <p className="text-red-800 dark:text-red-300 text-xs mt-1">
              You have exceeded the 72-hour limit by {(od_hours_used - 72).toFixed(1)} hours.
            </p>
          </div>
        )}

        {od_hours_remaining < 10 && od_hours_used <= 72 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-yellow-900 dark:text-yellow-100 font-semibold text-sm">ℹ️ Low OD Balance</p>
            <p className="text-yellow-800 dark:text-yellow-300 text-xs mt-1">
              Only {od_hours_remaining.toFixed(1)} hours remaining.
            </p>
          </div>
        )}

        {od_hours_used === 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-blue-900 dark:text-blue-100 font-semibold text-sm">💡 Tip</p>
            <p className="text-blue-800 dark:text-blue-300 text-xs mt-1">
              Mark attendance as "OD" for official duties. OD hours count as present and are tracked
              here.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs text-gray-700 dark:text-gray-300">
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
