'use client';

import { useData } from '@/components/DataProvider';
import Link from 'next/link';

// Icons
const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

export const SafeMarginCalculator = () => {
  const { data, getStats, getSafeMargin } = useData();

  if (!data || data.subjects.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
        <p className="text-yellow-900 dark:text-yellow-200">Please set up your subjects and timetable first.</p>
        <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-2 inline-block">
          Go to Settings →
        </Link>
      </div>
    );
  }

  if (!data.semester_config.end_date) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
        <p className="text-yellow-900 dark:text-yellow-200 font-semibold">Semester End Date not set</p>
        <p className="text-yellow-800 dark:text-yellow-300 text-sm mt-2">
          The Safe Margin Calculator needs to know when your semester ends to calculate how many classes you can skip.
        </p>
        <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mt-3 inline-block">
          Set it in Settings →
        </Link>
      </div>
    );
  }

  const stats = getStats();
  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Safe Margin Calculator</h2>

      <p className="text-sm text-gray-600 dark:text-gray-300">
        How many sessions can you safely skip while maintaining minimum attendance?
      </p>

      {/* Disclaimer */}
      <div className="p-4 bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-700 rounded-xl text-sm text-orange-800 dark:text-orange-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg flex-shrink-0">
            <BookOpenIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="font-bold text-orange-900 dark:text-orange-100 mb-1">A Note on Academic Excellence</p>
            <p>
              This tool is designed purely for <strong>educational planning purposes</strong> — helping you manage 
              unavoidable absences like medical emergencies or family events. Studies show that students who attend 
              all classes score 23% higher on average.* We strongly encourage maximizing your classroom learning 
              experience. After all, you're paying for every lecture!
            </p>
            <p className="text-orange-600 dark:text-orange-400 mt-2 text-xs italic flex items-center gap-1">
              *Source: Trust us, bro. But seriously, please attend class. Your future self will thank you.
              <AcademicCapIcon className="w-4 h-4 inline" />
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {data.subjects.map((subject) => {
          const subjectKey = subject.subject_code || subject.subject_name;
          const safeMargin = getSafeMargin(subjectKey);
          if (!safeMargin) return null;

          return (
            <div key={subjectKey} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{subject.subject_name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{subject.subject_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mb-1">FUTURE SESSIONS</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{safeMargin.future_sessions}</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1">MUST ATTEND</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{safeMargin.must_attend}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-400 font-semibold mb-1">CAN SKIP</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{safeMargin.can_skip}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Projected Total</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {safeMargin.projected_total} sessions (min 75% = {safeMargin.min_required})
                  </span>
                </div>
              </div>

              {safeMargin.can_skip > 0 ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100">✓ Safe</p>
                  <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                    You can skip <strong>{safeMargin.can_skip} sessions</strong> and still maintain
                    75% attendance.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-sm font-semibold text-red-900 dark:text-red-100">⚠️ Critical</p>
                  <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                    You must attend <strong>all {safeMargin.future_sessions} remaining sessions</strong> to
                    maintain 75% attendance.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-2">📌 How this works:</p>
        <ul className="space-y-1">
          <li>• Shows sessions until <strong>{data.semester_config.end_date}</strong></li>
          <li>• Calculates minimum sessions needed for <strong>75% per-subject</strong> attendance</li>
          <li>• "Can Skip" = safely absent sessions without going below threshold</li>
          <li>• Based on current progress + estimated future sessions</li>
        </ul>
      </div>
    </div>
  );
};
