'use client';

import { useAttendanceData } from '@/hooks/useAttendanceData';
import { DashboardCard } from '@/components/DashboardCard';
import { SubjectDetailModal } from '@/components/SubjectDetailModal';
import { useEffect, useState } from 'react';
import { OverallStats, AttendanceStats } from '@/types';

export default function Dashboard() {
  const { data, loading, getStats } = useAttendanceData();
  const [stats, setStats] = useState<{
    overall_stats: OverallStats;
    subject_stats: AttendanceStats[];
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<AttendanceStats | null>(null);

  useEffect(() => {
    if (data && !loading) {
      const calculated = getStats();
      setStats(calculated);
    }
  }, [data, loading, getStats]);

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
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to ERP Attendance Tracker
            </h2>
            <p className="text-gray-600 mb-6">
              To get started, set up your semester configuration, subjects, and timetable.
            </p>
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

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-700">Calculating stats...</div>
      </div>
    );
  }

  const { overall_stats, subject_stats } = stats;

  // Determine overall status color
  const getStatusColor = (percentage: number) => {
    if (percentage >= 82) return 'green';
    if (percentage >= 80) return 'yellow';
    return 'red';
  };

  const statusColor = getStatusColor(overall_stats.percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Current semester: {data.semester_config.start_date} to {data.semester_config.end_date}
          </p>
        </div>

        {/* Overall Stats Card */}
        <div
          className={`rounded-lg border-2 p-8 ${
            statusColor === 'green'
              ? 'bg-green-50 border-green-300'
              : statusColor === 'yellow'
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Overall Attendance</p>
              <p
                className={`text-5xl font-bold ${
                  statusColor === 'green'
                    ? 'text-green-700'
                    : statusColor === 'yellow'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}
              >
                {overall_stats.percentage}%
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-800">
                {overall_stats.total_sessions}
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">Attended</p>
              <p className="text-3xl font-bold text-green-600">
                {overall_stats.attended_sessions}
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">OD Hours Used</p>
              <p className="text-3xl font-bold text-blue-600">
                {overall_stats.od_hours_used}
              </p>
            </div>

            <div className="bg-white/60 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-1">OD Hours Remaining</p>
              <p className="text-3xl font-bold text-purple-600">
                {overall_stats.od_hours_remaining}
              </p>
            </div>
          </div>

          {/* Thresholds Info */}
          <div className="mt-6 pt-6 border-t border-gray-300/50">
            <p className="text-xs text-gray-600">
              ✓ Minimum 75% per subject | ✓ Minimum 80% overall | ⚠️ Warning at 77% subject / 82% overall
            </p>
          </div>
        </div>

        {/* Per-Subject Cards */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Per-Subject Attendance</h2>
          <p className="text-gray-600 text-sm mb-6">Click on a subject to view detailed attendance history</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subject_stats
              .filter((stat) => {
                const subject = data.subjects.find(s => s.subject_code === stat.subject_code || s.subject_name === stat.subject_name);
                return subject && subject.zero_credit_type !== 'library' && subject.zero_credit_type !== 'seminar';
              })
              .map((stat) => (
                <DashboardCard
                  key={stat.subject_code || stat.subject_name}
                  stats={stat}
                  onClick={() => setSelectedSubject(stat)}
                />
              ))
            }
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/attendance"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Log Attendance</h3>
            <p className="text-gray-600 text-sm">
              Mark today's attendance or update past records
            </p>
          </a>

          <a
            href="/planner"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 Simulate Leave</h3>
            <p className="text-gray-600 text-sm">
              Check impact of potential leave dates
            </p>
          </a>

          <a
            href="/planner"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚡ Safe Margin</h3>
            <p className="text-gray-600 text-sm">
              See how many sessions you can skip
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
