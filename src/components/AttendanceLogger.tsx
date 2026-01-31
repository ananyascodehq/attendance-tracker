'use client';

import { useState, useMemo } from 'react';
import { TimetableSlot, AttendanceStatus, Holiday, SemesterConfig } from '@/types';

// Modal icons
const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

interface AttendanceLoggerProps {
  date: string;
  timetable: TimetableSlot[];
  onLogAttendance: (period: number, subject: string | undefined, status: AttendanceStatus, notes?: string) => void;
  onDeleteAttendance: (period: number, subject: string | undefined) => void;
  existingLogs: Map<string, AttendanceStatus>; // key: "period-subject"
  existingNotes?: Map<string, string>; // key: "period-subject", for OD reasons
  holidays?: Holiday[]; // List of holidays to check against
  semesterConfig?: SemesterConfig; // Semester dates to check against
  onSave?: () => void;
}

// Icons
const XCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BoltIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CalendarOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const GiftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const CalendarBlockedIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728" />
  </svg>
);

export const AttendanceLogger = ({
  date,
  timetable,
  onLogAttendance,
  onDeleteAttendance,
  existingLogs,
  existingNotes,
  holidays,
  semesterConfig,
  onSave,
}: AttendanceLoggerProps) => {
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null);
  
  // OD Reason Modal State - now supports multiple periods
  const [odModal, setOdModal] = useState<{
    isOpen: boolean;
    periods: Array<{ period: number; subject: string | undefined }>;
    reason: string;
  }>({ isOpen: false, periods: [], reason: '' });

  // Get day name for the date
  const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

  // Check if selected date is a holiday
  const holiday = useMemo(() => {
    return holidays?.find((h) => h.date === date);
  }, [holidays, date]);

  // Check if selected date is outside semester dates
  const outOfSemester = useMemo(() => {
    if (!semesterConfig) return null;
    const selectedDate = new Date(date);
    const startDate = new Date(semesterConfig.start_date);
    const endDate = new Date(semesterConfig.end_date);
    
    if (selectedDate < startDate) {
      return { type: 'before', message: 'Before semester start' };
    }
    if (selectedDate > endDate) {
      return { type: 'after', message: 'After semester end' };
    }
    return null;
  }, [semesterConfig, date]);

  // Get slots for this day
  const todaySlots = useMemo(
    () =>
      timetable
        .filter((slot) => slot.day_of_week === dayName)
        .sort((a, b) => a.period_number - b.period_number),
    [timetable, dayName]
  );

  // Get current OD slots for this day (for the floating bar)
  const odSlots = useMemo(() => {
    return todaySlots.filter((slot) => {
      const key = `${slot.period_number}-${slot.subject_code}`;
      return existingLogs.get(key) === 'od';
    });
  }, [todaySlots, existingLogs]);

  // Check if any OD slots are missing a reason
  const odSlotsWithoutReason = useMemo(() => {
    return odSlots.filter((slot) => {
      const key = `${slot.period_number}-${slot.subject_code}`;
      return !existingNotes?.get(key);
    });
  }, [odSlots, existingNotes]);

  const handleStatusClick = (period: number, subject: string | undefined, status: AttendanceStatus) => {
    const key = `${period}-${subject}`;
    const current = existingLogs.get(key);

    // Toggle off if clicking same status
    if (current === status) {
      onDeleteAttendance(period, subject);
      setSelectedStatus(null);
    } else {
      // For OD, just mark it directly (reason will be added via floating bar)
      onLogAttendance(period, subject, status);
      setSelectedStatus(status);
    }
  };

  const handleOpenOdReasonModal = () => {
    // Open modal with all current OD periods
    const periods = odSlots.map((slot) => ({
      period: slot.period_number,
      subject: slot.subject_code,
    }));
    // Get existing reason from first OD slot (if any have one)
    const firstKey = `${odSlots[0]?.period_number}-${odSlots[0]?.subject_code}`;
    const existingReason = existingNotes?.get(firstKey) || '';
    setOdModal({ isOpen: true, periods, reason: existingReason });
  };

  const handleOdSubmit = () => {
    // Apply reason to all OD periods
    odModal.periods.forEach(({ period, subject }) => {
      onLogAttendance(period, subject, 'od', odModal.reason);
    });
    setOdModal({ isOpen: false, periods: [], reason: '' });
  };

  const handleOdCancel = () => {
    setOdModal({ isOpen: false, periods: [], reason: '' });
  };

  const handleMarkDayAsAbsent = () => {
    todaySlots.forEach((slot) => {
      onLogAttendance(slot.period_number, slot.subject_code, 'leave');
    });
  };

  const handleMarkDayAsOD = () => {
    // Mark all as OD first
    todaySlots.forEach((slot) => {
      onLogAttendance(slot.period_number, slot.subject_code, 'od');
    });
    // Then open modal for reason
    const periods = todaySlots.map((slot) => ({
      period: slot.period_number,
      subject: slot.subject_code,
    }));
    setOdModal({ isOpen: true, periods, reason: '' });
  };

  const handleClearAll = () => {
    todaySlots.forEach((slot) => {
      onDeleteAttendance(slot.period_number, slot.subject_code);
    });
  };

  // Count stats for the day
  const dayStats = useMemo(() => {
    let absent = 0;
    let od = 0;
    let present = 0;
    todaySlots.forEach((slot) => {
      const key = `${slot.period_number}-${slot.subject_code}`;
      const status = existingLogs.get(key);
      if (status === 'leave') absent++;
      else if (status === 'od') od++;
      else present++;
    });
    return { absent, od, present, total: todaySlots.length };
  }, [todaySlots, existingLogs]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Holiday Banner - shown when date is a holiday */}
      {holiday ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full mb-4">
            <GiftIcon className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">It's a Holiday! 🎉</h2>
          <p className="text-amber-700 dark:text-amber-400 font-medium text-lg mb-1">{holiday.description}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No attendance to log on {dayName}
          </p>
        </div>
      ) : outOfSemester ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <CalendarBlockedIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {outOfSemester.type === 'before' ? 'Before Semester' : 'After Semester'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-1">
            {outOfSemester.type === 'before' 
              ? `Semester starts on ${new Date(semesterConfig!.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
              : `Semester ended on ${new Date(semesterConfig!.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
            }
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No attendance to log for this date
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{dayName}'s Classes</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {todaySlots.length} {todaySlots.length === 1 ? 'class' : 'classes'} scheduled
                </p>
              </div>
              
              {todaySlots.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleMarkDayAsAbsent}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    All Absent
                  </button>
                  <button
                    onClick={handleMarkDayAsOD}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors text-sm font-medium"
                  >
                    <BoltIcon className="w-4 h-4" />
                    All OD
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <RefreshIcon className="w-4 h-4" />
                    Reset All
                  </button>
                </div>
              )}
            </div>

            {/* Day Stats */}
            {todaySlots.length > 0 && (
              <div className="flex gap-3 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">{dayStats.present} Present</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">{dayStats.absent} Absent</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 rounded-full">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  <span className="text-xs font-medium text-violet-700 dark:text-violet-400">{dayStats.od} OD</span>
                </div>
              </div>
            )}
          </div>

          {/* Slots List */}
          {todaySlots.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarOffIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">No classes on {dayName}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Select a different date or check your timetable</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {todaySlots.map((slot) => {
            const logKey = `${slot.period_number}-${slot.subject_code}`;
            const currentStatus = existingLogs.get(logKey);
            
            // Determine row background based on status
            const rowBg = currentStatus === 'leave' 
              ? 'bg-red-50/50 dark:bg-red-900/20' 
              : currentStatus === 'od' 
                ? 'bg-violet-50/50 dark:bg-violet-900/20' 
                : 'bg-white dark:bg-gray-800';

            return (
              <div
                key={slot.id}
                className={`p-4 ${rowBg} transition-colors`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  {/* Period Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Period</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">{slot.period_number}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{slot.subject_code}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{slot.start_time} – {slot.end_time}</p>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Present indicator or button */}
                    {!currentStatus ? (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                        <CheckCircleIcon className="w-4 h-4" />
                        Present
                      </div>
                    ) : (
                      <button
                        onClick={() => onDeleteAttendance(slot.period_number, slot.subject_code)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
                        title="Mark as Present"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Present
                      </button>
                    )}

                    {/* Absent Button */}
                    <button
                      onClick={() => handleStatusClick(slot.period_number, slot.subject_code, 'leave')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentStatus === 'leave'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                      title="Mark as Absent"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Absent
                    </button>

                    {/* OD Button */}
                    <button
                      onClick={() => handleStatusClick(slot.period_number, slot.subject_code, 'od')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentStatus === 'od'
                          ? 'bg-violet-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400'
                      }`}
                      title="Mark as On-Duty"
                    >
                      <BoltIcon className="w-4 h-4" />
                      OD
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Floating OD Reason Bar - shows only when there are OD entries WITHOUT a reason */}
      {odSlotsWithoutReason.length > 0 && !odModal.isOpen && !holiday && !outOfSemester && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-400 px-4 py-2.5 rounded-lg shadow-md flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <BoltIcon className="w-4 h-4" />
              <span>{odSlotsWithoutReason.length} OD {odSlotsWithoutReason.length === 1 ? 'period' : 'periods'} missing reason</span>
            </div>
            <button
              onClick={handleOpenOdReasonModal}
              className="px-3 py-1 bg-violet-100 dark:bg-violet-900/50 hover:bg-violet-200 dark:hover:bg-violet-900/70 rounded-md font-medium transition-colors flex items-center gap-1.5 text-sm"
            >
              <PencilIcon className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      )}

      {/* OD Reason Modal */}
      {odModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-violet-50 dark:bg-violet-900/30 px-6 py-4 border-b border-violet-100 dark:border-violet-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                  <BoltIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Add OD Reason</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    For {odModal.periods.length} {odModal.periods.length === 1 ? 'period' : 'periods'}
                  </p>
                </div>
              </div>
            </div>

            {/* Periods List */}
            <div className="px-6 pt-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Selected Periods</p>
              <div className="flex flex-wrap gap-2">
                {odModal.periods.map(({ period, subject }) => (
                  <span
                    key={`${period}-${subject}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-400 rounded-full text-sm font-medium"
                  >
                    <span className="w-5 h-5 bg-violet-200 dark:bg-violet-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {period}
                    </span>
                    {subject || 'Class'}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label className="block mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <PencilIcon className="w-4 h-4" />
                  OD Reason
                </span>
              </label>
              <textarea
                value={odModal.reason}
                onChange={(e) => setOdModal({ ...odModal, reason: e.target.value })}
                placeholder="e.g., Sports event, Workshop, Guest lecture..."
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                rows={3}
                autoFocus
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This reason will apply to all selected periods.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={handleOdCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOdSubmit}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition-colors flex items-center gap-2"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Save Reason
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
