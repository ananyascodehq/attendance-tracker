'use client';

import { useAttendanceData } from '@/hooks/useAttendanceData';

export const SafeMarginCalculator = () => {
  const { data, getStats, getSafeMargin } = useAttendanceData();

  if (!data || data.subjects.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-900">Please set up your timetable first.</p>
      </div>
    );
  }

  const stats = getStats();
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Safe Margin Calculator</h2>

      <p className="text-sm text-gray-600">
        How many sessions can you safely skip while maintaining minimum attendance?
      </p>

      <div className="space-y-4">
        {data.subjects.map((subject) => {
          const safeMargin = getSafeMargin(subject.subject_code);
          if (!safeMargin) return null;

          const percentage = (safeMargin.must_attend / safeMargin.future_sessions) * 100;

          return (
            <div key={subject.subject_code} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{subject.subject_name}</p>
                  <p className="text-xs text-gray-600">{subject.subject_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700 font-semibold mb-1">FUTURE SESSIONS</p>
                  <p className="text-2xl font-bold text-blue-900">{safeMargin.future_sessions}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-red-700 font-semibold mb-1">MUST ATTEND</p>
                  <p className="text-2xl font-bold text-red-900">{safeMargin.must_attend}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-semibold mb-1">CAN SKIP</p>
                  <p className="text-2xl font-bold text-green-900">{safeMargin.can_skip}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Projected Total</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {safeMargin.projected_total} sessions (min 75% = {safeMargin.min_required})
                  </span>
                </div>
              </div>

              {safeMargin.can_skip > 0 ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-900">✓ Safe</p>
                  <p className="text-xs text-green-800 mt-1">
                    You can skip <strong>{safeMargin.can_skip} sessions</strong> and still maintain
                    75% attendance.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-900">⚠️ Critical</p>
                  <p className="text-xs text-red-800 mt-1">
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
      <div className="p-4 bg-blue-50 rounded-lg text-xs text-blue-800">
        <p className="font-semibold mb-2">📌 How this works:</p>
        <ul className="space-y-1">
          <li>• Shows sessions until <strong>{data.semester_config.last_instruction_date}</strong></li>
          <li>• Calculates minimum sessions needed for <strong>75% per-subject</strong> attendance</li>
          <li>• "Can Skip" = safely absent sessions without going below threshold</li>
          <li>• Based on current progress + estimated future sessions</li>
        </ul>
      </div>
    </div>
  );
};
