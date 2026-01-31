'use client';

import { AttendanceStats } from '@/types';

interface DashboardCardProps {
  stats: AttendanceStats;
  onClick?: () => void;
}

export const DashboardCard = ({ stats, onClick }: DashboardCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'safe':
        return {
          bg: 'bg-green-50 dark:bg-green-900/30',
          border: 'border-green-300 dark:border-green-700',
          text: 'text-green-700 dark:text-green-400',
          badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400',
          progress: 'bg-green-500',
          icon: '✓',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/30',
          border: 'border-yellow-300 dark:border-yellow-700',
          text: 'text-yellow-700 dark:text-yellow-400',
          badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
          progress: 'bg-yellow-500',
          icon: '⚠',
        };
      default:
        return {
          bg: 'bg-red-50 dark:bg-red-900/30',
          border: 'border-red-300 dark:border-red-700',
          text: 'text-red-700 dark:text-red-400',
          badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
          progress: 'bg-red-500',
          icon: '✕',
        };
    }
  };

  const config = getStatusConfig(stats.status);
  const missed = stats.total_sessions - stats.attended_sessions;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border-2 ${config.border} ${config.bg} p-5 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate">
            {stats.subject_name}
          </h3>
          {stats.subject_code && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{stats.subject_code}</p>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${config.badge} font-bold text-xl`}>
          <span className="text-sm">{config.icon}</span>
          {stats.percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>Progress</span>
          <span>{stats.attended_sessions}/{stats.total_sessions} sessions</span>
        </div>
        <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2.5 shadow-inner overflow-hidden">
          <div
            className={`h-full rounded-full ${config.progress} transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(stats.percentage, 100)}%` }}
          ></div>
        </div>
        {/* 75% threshold marker */}
        <div className="absolute bottom-0 left-[75%] w-0.5 h-2.5 bg-gray-400/50"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Present</p>
          <p className="font-bold text-gray-900 dark:text-white">{stats.present_count}</p>
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">OD</p>
          <p className="font-bold text-purple-600 dark:text-purple-400">{stats.od_count}</p>
        </div>
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-2.5 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Absent</p>
          <p className="font-bold text-red-600 dark:text-red-400">{missed > 0 ? missed : 0}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {stats.credits} {stats.credits === 1.5 ? 'credit (Lab)' : 'credits'}
        </span>
        <span className={`text-xs font-medium ${config.text} flex items-center gap-1`}>
          View details
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
};
