'use client';

import { useAttendanceData } from '@/hooks/useAttendanceData';
import { LeaveSimulator } from '@/components/LeaveSimulator';
import { OdTracker } from '@/components/OdTracker';
import { SafeMarginCalculator } from '@/components/SafeMarginCalculator';

export default function PlannerPage() {
  const { data, loading } = useAttendanceData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-700">No data found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Planning & Tools</h1>
          <p className="text-gray-600 mt-2">Simulate leave impact and check your safe margin</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Leave Simulator */}
          <div>
            <LeaveSimulator />
          </div>

          {/* Right Column - Tools */}
          <div className="space-y-8">
            <OdTracker />
            <SafeMarginCalculator />
          </div>
        </div>

        {/* Semester Info */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Current Semester</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-semibold mb-1">START DATE</p>
              <p className="text-lg font-bold text-blue-900">
                {data.semester_config.start_date || 'Not set'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-semibold mb-1">END DATE</p>
              <p className="text-lg font-bold text-blue-900">
                {data.semester_config.end_date || 'Not set'}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-semibold mb-1">LAST INSTRUCTION</p>
              <p className="text-lg font-bold text-blue-900">
                {data.semester_config.last_instruction_date || 'Not set'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-1">Subjects</p>
            <p className="text-4xl font-bold text-gray-900">{data.subjects.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-1">Timetable Slots</p>
            <p className="text-4xl font-bold text-gray-900">{data.timetable.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium mb-1">Holidays</p>
            <p className="text-4xl font-bold text-gray-900">{data.holidays.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
