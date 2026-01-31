'use client';

import { useState } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import SubjectsManager from '@/components/SubjectsManager';
import TimetableBuilder from '@/components/TimetableBuilder';
import SemesterConfigManager from '@/components/SemesterConfigManager';

export default function SettingsPage() {
  const { data, loading, updateAllSubjects, updateAllTimetable, updateSemesterConfig, updateAllHolidays } =
    useAttendanceData();
  const [activeTab, setActiveTab] = useState<'subjects' | 'timetable' | 'semester'>('subjects');

  if (loading || !data) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings & Configuration</h1>
        <p className="text-gray-600">
          Manage your subjects, build your timetable, and configure your semester.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'subjects'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📚 Subjects
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'timetable'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Timetable
        </button>
        <button
          onClick={() => setActiveTab('semester')}
          className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
            activeTab === 'semester'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🎓 Semester & Holidays
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'subjects' && (
        <SubjectsManager subjects={data.subjects} onUpdate={updateAllSubjects} />
      )}

      {activeTab === 'timetable' && (
        <>
          {data.subjects.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 font-medium mb-4">
                📚 Please add at least one subject before building your timetable.
              </p>
              <button
                onClick={() => setActiveTab('subjects')}
                className="bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-700"
              >
                Go to Subjects
              </button>
            </div>
          ) : (
            <TimetableBuilder
              timetable={data.timetable}
              subjects={data.subjects}
              onUpdate={updateAllTimetable}
            />
          )}
        </>
      )}

      {activeTab === 'semester' && (
        <SemesterConfigManager
          config={data.semester_config}
          holidays={data.holidays}
          onConfigUpdate={updateSemesterConfig}
          onHolidaysUpdate={updateAllHolidays}
        />
      )}

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{data.subjects.length}</div>
          <div className="text-sm text-blue-700 font-medium">Subjects</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">{data.timetable.length}</div>
          <div className="text-sm text-green-700 font-medium">Classes/Week</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{data.holidays.length}</div>
          <div className="text-sm text-purple-700 font-medium">Holidays</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-sm text-orange-700 font-medium">Semester</div>
          <div className="text-xs text-orange-600 mt-1">
            {new Date(data.semester_config.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            -{' '}
            {new Date(data.semester_config.end_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
