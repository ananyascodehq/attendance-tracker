'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/components/DataProvider';
import { AttendanceLogger } from '@/components/AttendanceLogger';
import { PageLoader } from '@/components/Spinner';
import Link from 'next/link';

// Icons
const ClipboardCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function AttendancePage() {
  const { data, loading, getTodayISO, addAttendanceLog, deleteAttendanceLog } =
    useData();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Create a map of existing logs for quick lookup - MUST be before early returns
  const logsMap = useMemo(() => {
    if (!data) return new Map();
    const map = new Map<string, any>();
    data.attendance
      .filter((log) => log.date === selectedDate)
      .forEach((log) => {
        map.set(`${log.period_number}-${log.subject_code}`, log.status);
      });
    return map;
  }, [data, selectedDate]);

  // Create a map of existing notes (for OD reasons) for quick lookup
  const notesMap = useMemo(() => {
    if (!data) return new Map();
    const map = new Map<string, string>();
    data.attendance
      .filter((log) => log.date === selectedDate && log.notes)
      .forEach((log) => {
        map.set(`${log.period_number}-${log.subject_code}`, log.notes!);
      });
    return map;
  }, [data, selectedDate]);

  // Date navigation helpers
  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === getTodayISO();

  // Format selected date nicely
  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return <PageLoader variant="attendance" message="Loading attendance..." />;
  }

  if (!data || data.subjects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 via-white dark:via-gray-900 to-slate-100 dark:to-gray-800 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <ClipboardCheckIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">No Setup Data Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please set up your subjects and timetable first.</p>
            <Link
              href="/settings"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogAttendance = (period: number, subject: string | undefined, status: any, notes?: string) => {
    setSaveStatus('saving');
    addAttendanceLog({
      date: selectedDate,
      period_number: period as any,
      subject_code: subject,
      status,
      notes,
    });
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  const handleDeleteAttendance = (period: number, subject: string | undefined) => {
    setSaveStatus('saving');
    deleteAttendanceLog(selectedDate, period, subject);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 via-white dark:via-gray-900 to-slate-100 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Attendance</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Mark your attendance for any day. Default is present — only log exceptions.
          </p>
        </div>

        {/* Date Picker Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            {/* Previous Day */}
            <button
              onClick={goToPreviousDay}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Previous day"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Date Display */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-lg font-semibold text-gray-900 dark:text-white border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 cursor-pointer"
                />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{formattedDate}</p>
              {isToday && (
                <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                  Today
                </span>
              )}
            </div>

            {/* Next Day */}
            <button
              onClick={goToNextDay}
              className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Next day"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Quick Jump */}
          {!isToday && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedDate(getTodayISO())}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium hover:underline"
              >
                Jump to Today →
              </button>
            </div>
          )}
        </div>

        {/* Attendance Logger */}
        <AttendanceLogger
          date={selectedDate}
          timetable={data.timetable}
          onLogAttendance={handleLogAttendance}
          onDeleteAttendance={handleDeleteAttendance}
          existingLogs={logsMap}
          existingNotes={notesMap}
          holidays={data.holidays}
          semesterConfig={data.semester_config}
        />

        {/* Pro Tips */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <LightBulbIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-200">Pro Tips</h3>
              <ul className="mt-2 text-sm text-amber-800 dark:text-amber-300 space-y-1">
                <li>• <strong>Default is Present</strong> — only mark when you're absent or on OD</li>
                <li>• <strong>Absent</strong> counts against your attendance percentage</li>
                <li>• <strong>OD (On-Duty)</strong> counts as present — use for official events</li>
                <li>• Changes save automatically to your browser</li>
              </ul>
            </div>
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
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400'
              : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400'
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
