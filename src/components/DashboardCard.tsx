'use client';

import { AttendanceStats } from '@/types';

interface DashboardCardProps {
  stats: AttendanceStats;
  onClick?: () => void;
}

export const DashboardCard = ({ stats, onClick }: DashboardCardProps) => {
  const statusColors = {
    safe: 'bg-green-50 border-green-300',
    warning: 'bg-yellow-50 border-yellow-300',
    danger: 'bg-red-50 border-red-300',
  };

  const percentageColors = {
    safe: 'text-green-700 bg-green-100',
    warning: 'text-yellow-700 bg-yellow-100',
    danger: 'text-red-700 bg-red-100',
  };

  const progressColors = {
    safe: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] ${statusColors[stats.status]}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{stats.subject_name}</h3>
          <p className="text-sm text-gray-600">{stats.subject_code}</p>
        </div>
        <span
          className={`text-2xl font-bold px-3 py-1 rounded-lg ${percentageColors[stats.status]}`}
        >
          {stats.percentage}%
        </span>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${progressColors[stats.status]}`}
            style={{ width: `${Math.min(stats.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-white/50 p-2 rounded">
          <p className="text-gray-600">Cumulative Periods</p>
          <p className="font-semibold">{stats.total_sessions}</p>
        </div>
        <div className="bg-white/50 p-2 rounded">
          <p className="text-gray-600">Attended</p>
          <p className="font-semibold">{stats.attended_sessions}</p>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-300/50">
        <p className="text-xs text-gray-600">
          Credits: {stats.credits}
        </p>
      </div>
    </div>
  );
};
