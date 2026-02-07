'use client';

import { useData } from '@/components/DataProvider';
import { DashboardCard } from '@/components/DashboardCard';
import { SubjectDetailModal } from '@/components/SubjectDetailModal';
import { AttendanceChart } from '@/components/AttendanceChart';
import { useEffect, useState } from 'react';
import { OverallStats, AttendanceStats } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const { data, loading, getStats } = useData();
  const [stats, setStats] = useState<{
    overall_stats: OverallStats;
    subject_stats: AttendanceStats[];
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<AttendanceStats | null>(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (data && !loading) {
      const calculated = getStats();
      setStats(calculated);
    }
  }, [data, loading, getStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 to-blue-50 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data || data.subjects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* Simple icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
            Attendance Tracker
          </h1>
          
          {/* Description */}
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Track your college attendance and never fall below 75%
          </p>

          {/* CTA Button */}
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 to-blue-50 dark:to-gray-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Calculating stats...</p>
        </div>
      </div>
    );
  }

  const { overall_stats, subject_stats } = stats;

  // Filter out library/seminar for display
  const displayStats = subject_stats.filter((stat) => {
    const subject = data.subjects.find(s => s.subject_code === stat.subject_code || s.subject_name === stat.subject_name);
    return subject && subject.zero_credit_type !== 'library' && subject.zero_credit_type !== 'seminar';
  });

  // Count subjects by status
  const safeCount = displayStats.filter(s => s.status === 'safe').length;
  const warningCount = displayStats.filter(s => s.status === 'warning').length;
  const dangerCount = displayStats.filter(s => s.status === 'danger').length;

  // Determine overall status
  const getOverallConfig = (percentage: number) => {
    if (percentage >= 82) {
      return {
        gradient: 'from-emerald-500 to-green-600',
        bg: 'bg-gradient-to-br from-emerald-500 to-green-600',
        lightBg: 'bg-emerald-50',
        text: 'text-emerald-600',
        ring: 'ring-emerald-500/20',
        label: 'Excellent',
        emoji: '🎯',
      };
    }
    if (percentage >= 80) {
      return {
        gradient: 'from-amber-500 to-yellow-600',
        bg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
        lightBg: 'bg-amber-50',
        text: 'text-amber-600',
        ring: 'ring-amber-500/20',
        label: 'Good',
        emoji: '⚡',
      };
    }
    return {
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-gradient-to-br from-red-500 to-rose-600',
      lightBg: 'bg-red-50',
      text: 'text-red-600',
      ring: 'ring-red-500/20',
      label: 'At Risk',
      emoji: '⚠️',
    };
  };

  const overallConfig = getOverallConfig(overall_stats.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 via-gray-50 dark:via-gray-900 to-blue-50 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              
              {/* Left: Main Percentage Display */}
              <div className="flex items-center gap-6">
                <div className={`relative w-32 h-32 ${overallConfig.bg} rounded-3xl shadow-2xl flex items-center justify-center`}>
                  <div className="text-white text-center">
                    <div className="text-4xl font-black">{overall_stats.percentage}%</div>
                    <div className="text-sm font-medium opacity-90">{overallConfig.label}</div>
                  </div>
                  <div className="absolute -top-2 -right-2 text-2xl">{overallConfig.emoji}</div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Overall Attendance</h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {data.semester_config.start_date} → {data.semester_config.end_date}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {safeCount} Safe
                    </span>
                    {warningCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {warningCount} Warning
                      </span>
                    )}
                    {dangerCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {dangerCount} Critical
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{overall_stats.total_sessions}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Sessions</div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{overall_stats.attended_sessions}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Attended</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{overall_stats.od_hours_used}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">OD Used</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overall_stats.od_hours_remaining}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">OD Left</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setShowChart(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Charts
              </button>
              <Link
                href="/attendance"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Log Attendance
              </Link>
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Simulate Leave
              </Link>
            </div>
          </div>
        </div>

        {/* Subjects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Subjects</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Click on any subject to view detailed attendance history</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {displayStats.length} subjects
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayStats.map((stat) => (
              <DashboardCard
                key={stat.subject_code || stat.subject_name}
                stats={stat}
                onClick={() => setSelectedSubject(stat)}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/attendance"
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-100 dark:shadow-gray-900/50 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Log Attendance</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Mark today's attendance or update past records</p>
            </div>
          </Link>

          <Link
            href="/planner"
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-100 dark:shadow-gray-900/50 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Leave Simulator</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Check impact of potential leave dates</p>
            </div>
          </Link>

          <Link
            href="/planner"
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-100 dark:shadow-gray-900/50 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Safe Margin</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">See how many sessions you can skip</p>
            </div>
          </Link>
        </div>

        {/* Threshold Info */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ≥82% Overall = Safe
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              80-82% = Warning
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              &lt;80% = At Risk
            </span>
            <span className="border-l border-gray-300 dark:border-gray-600 pl-6">Min 75% per subject</span>
          </div>
        </div>

        {/* Subject Detail Modal */}
        {selectedSubject && (
          <SubjectDetailModal
            stats={selectedSubject}
            timetable={data.timetable}
            attendance={data.attendance}
            holidays={data.holidays}
            semesterConfig={data.semester_config}
            onClose={() => setSelectedSubject(null)}
          />
        )}

        {/* Attendance Chart Modal */}
        {showChart && (
          <AttendanceChart
            subjectStats={displayStats}
            onClose={() => setShowChart(false)}
          />
        )}
      </div>
    </div>
  );
}
