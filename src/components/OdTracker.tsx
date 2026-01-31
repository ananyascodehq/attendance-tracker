'use client';

import { ODLog } from '@/types';
import { MAX_OD_HOURS } from '@/lib/constants';

interface OdTrackerProps {
  logs: ODLog[];
}

export const OdTracker = ({ logs }: OdTrackerProps) => {
  const totalOdUsed = logs
    .filter((log) => log.approval_status === 'approved')
    .reduce((sum, log) => sum + log.hours_used, 0);

  const remainingOd = MAX_OD_HOURS - totalOdUsed;
  const percentage = (totalOdUsed / MAX_OD_HOURS) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">OD Hours Tracker</h2>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Total OD Used</span>
          <span className="text-2xl font-bold">{totalOdUsed.toFixed(1)} hrs</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-blue-600 transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {remainingOd.toFixed(1)} hours remaining out of {MAX_OD_HOURS}
        </p>
      </div>

      {logs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Recent OD:</h3>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {logs.slice(-5).map((log) => (
              <div
                key={log.id}
                className="p-2 bg-gray-50 rounded text-xs border-l-2 border-blue-400"
              >
                <p className="font-medium">{log.reason}</p>
                <p className="text-gray-600">{log.date} - {log.hours_used} hrs</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
