'use client';

import { AttendanceStats } from '@/types';
import { STATUS_TAILWIND } from '@/lib/constants';

interface DashboardCardProps {
  stats: AttendanceStats;
}

export const DashboardCard = ({ stats }: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{borderColor: stats.status === 'safe' ? '#10b981' : stats.status === 'caution' ? '#f59e0b' : '#ef4444'}}>
      <h3 className="font-semibold text-lg mb-2">{stats.subject_name}</h3>
      <p className="text-sm text-gray-600 mb-2">{stats.subject_code}</p>
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Attendance</span>
          <span className={`text-lg font-bold ${STATUS_TAILWIND[stats.status]}`}>
            {stats.percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              stats.status === 'safe'
                ? 'bg-green-500'
                : stats.status === 'caution'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(stats.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Present</p>
          <p className="font-semibold">{stats.present}</p>
        </div>
        <div>
          <p className="text-gray-500">Absent</p>
          <p className="font-semibold">{stats.absent}</p>
        </div>
        <div>
          <p className="text-gray-500">OD</p>
          <p className="font-semibold">{stats.od}</p>
        </div>
      </div>
    </div>
  );
};
