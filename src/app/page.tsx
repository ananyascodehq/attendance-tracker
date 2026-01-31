'use client';

import { useAttendanceData } from '@/hooks/useAttendanceData';
import { DashboardCard } from '@/components/DashboardCard';
import { OdTracker } from '@/components/OdTracker';
import { SafeMarginCalculator } from '@/components/SafeMarginCalculator';
import { AttendanceStats } from '@/types';
import { calculateOverallStats } from '@/lib/calculations';

export default function Dashboard() {
  const { data, isLoading } = useAttendanceData();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!data || !data.semester_end_date) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2">
            Welcome to AttendanceTracker
          </h2>
          <p className="text-yellow-800 mb-4">
            To get started, please set up your timetable and semester details.
          </p>
          <a
            href="/planner"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Setup
          </a>
        </div>
      </div>
    );
  }

  // Mock attendance stats - in production, calculate from actual data
  const subjectStats: AttendanceStats[] = data.subjects.map((subject) => ({
    subject_code: subject.subject_code,
    subject_name: subject.subject_name,
    credits: subject.credits,
    total_classes: 35,
    present: 28,
    absent: 5,
    od: 2,
    percentage: 86,
    status: 'safe',
  }));

  const overallStats = calculateOverallStats(subjectStats);

  return (
    <div className="space-y-8">
      {/* Overall Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Overall Attendance</p>
            <p
              className={`text-3xl font-bold ${
                overallStats.status === 'safe'
                  ? 'text-green-600'
                  : overallStats.status === 'caution'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {overallStats.percentage}%
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Total Classes</p>
            <p className="text-3xl font-bold text-green-600">
              {overallStats.total_classes}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Present</p>
            <p className="text-3xl font-bold text-purple-600">
              {overallStats.present}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-gray-600 text-sm">Absent</p>
            <p className="text-3xl font-bold text-red-600">
              {overallStats.absent}
            </p>
          </div>
        </div>
      </div>

      {/* Per-Subject Cards */}
      <div>
        <h2 className="text-xl font-bold mb-4">Per-Subject Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats.map((stats) => (
            <DashboardCard key={stats.subject_code} stats={stats} />
          ))}
        </div>
      </div>

      {/* Planning Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OdTracker logs={data.od_logs} />
        <SafeMarginCalculator stats={subjectStats} semesterEndDate={data.semester_end_date} />
      </div>
    </div>
  );
}
