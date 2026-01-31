'use client';

import { useState, useEffect } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import SubjectsManager from '@/components/SubjectsManager';
import TimetableBuilder from '@/components/TimetableBuilder';
import SemesterConfigManager from '@/components/SemesterConfigManager';

// SVG Icons
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

type TabId = 'subjects' | 'timetable' | 'semester';

interface TabConfig {
  id: TabId;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const tabs: TabConfig[] = [
  {
    id: 'subjects',
    name: 'Subjects',
    icon: <BookIcon className="w-5 h-5" />,
    description: 'Add and manage your courses',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  {
    id: 'timetable',
    name: 'Timetable',
    icon: <CalendarIcon className="w-5 h-5" />,
    description: 'Build your weekly schedule',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
  },
  {
    id: 'semester',
    name: 'Semester & Holidays',
    icon: <AcademicCapIcon className="w-5 h-5" />,
    description: 'Configure dates and holidays',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
  },
];

export default function SettingsPage() {
  const { data, loading, updateAllSubjects, updateAllTimetable, updateSemesterConfig, updateAllHolidays } =
    useAttendanceData();
  const [activeTab, setActiveTab] = useState<TabId>('subjects');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Track changes and show save indicator
  const handleSubjectsUpdate = (subjects: typeof data.subjects) => {
    setSaveStatus('saving');
    updateAllSubjects(subjects);
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  const handleTimetableUpdate = (timetable: typeof data.timetable) => {
    setSaveStatus('saving');
    updateAllTimetable(timetable);
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  const handleConfigUpdate = (config: typeof data.semester_config) => {
    setSaveStatus('saving');
    updateSemesterConfig(config);
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  const handleHolidaysUpdate = (holidays: typeof data.holidays) => {
    setSaveStatus('saving');
    updateAllHolidays(holidays);
    setTimeout(() => {
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading settings...</div>
        </div>
      </div>
    );
  }

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 via-white dark:via-gray-900 to-slate-100 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <SettingsIcon className="w-8 h-8 text-gray-700 dark:text-gray-200" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Configure your subjects, timetable, and semester details.
          </p>

          {/* Quick Stats */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2 flex items-center gap-2">
              <BookIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">{data.subjects.length}</span>
              <span className="text-blue-700 dark:text-blue-400 text-sm">subjects</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-lg px-4 py-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-900 dark:text-emerald-100">{data.timetable.length}</span>
              <span className="text-emerald-700 dark:text-emerald-400 text-sm">classes/week</span>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-4 py-2 flex items-center gap-2">
              <AcademicCapIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-900 dark:text-purple-100">{data.holidays.length}</span>
              <span className="text-purple-700 dark:text-purple-400 text-sm">holidays</span>
            </div>
          </div>
        </div>

        {/* Tab Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.bgColor} dark:bg-opacity-20 ${tab.borderColor} shadow-lg scale-[1.02]`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={activeTab === tab.id ? tab.color : 'text-gray-400 dark:text-gray-500'}>
                  {tab.icon}
                </div>
                <div>
                  <h3 className={`font-bold ${activeTab === tab.id ? tab.color : 'text-gray-900 dark:text-white'}`}>
                    {tab.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tab.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={`rounded-2xl border-2 overflow-hidden ${activeTabConfig?.borderColor} ${activeTabConfig?.bgColor} dark:bg-opacity-20`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl m-1 p-6">
            {activeTab === 'subjects' && (
              <SubjectsManager subjects={data.subjects} onUpdate={handleSubjectsUpdate} />
            )}

            {activeTab === 'timetable' && (
              <>
                {data.subjects.length === 0 ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
                    <BookIcon className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-4">
                      Please add at least one subject before building your timetable.
                    </p>
                    <button
                      onClick={() => setActiveTab('subjects')}
                      className="bg-yellow-600 dark:bg-yellow-700 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors"
                    >
                      Go to Subjects
                    </button>
                  </div>
                ) : (
                  <TimetableBuilder
                    timetable={data.timetable}
                    subjects={data.subjects}
                    onUpdate={handleTimetableUpdate}
                  />
                )}
              </>
            )}

            {activeTab === 'semester' && (
              <SemesterConfigManager
                config={data.semester_config}
                holidays={data.holidays}
                onConfigUpdate={handleConfigUpdate}
                onHolidaysUpdate={handleHolidaysUpdate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Save Indicator */}
      <div
        className={`fixed bottom-6 right-6 transition-all duration-300 ${
          saveStatus === 'idle' ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
            saveStatus === 'saving'
              ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
          }`}
        >
          {saveStatus === 'saving' ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Saving...</span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">Saved!</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
