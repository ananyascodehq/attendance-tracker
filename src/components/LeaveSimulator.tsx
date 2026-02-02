'use client';

import { useState, useMemo } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { OverallStats, AttendanceStats, TimetableSlot } from '@/types';
import { eachDayOfInterval, parseISO, format, getDay } from 'date-fns';

// Map day index to day name
const dayIndexToName = (dayIndex: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
};

interface DaySchedule {
  date: string;
  dayName: string;
  slots: TimetableSlot[];
  isHoliday: boolean;
  holidayDescription?: string;
}

export const LeaveSimulator = () => {
  const { data, simulateLeaveImpact, getStats } = useAttendanceData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [simResult, setSimResult] = useState<{
    overall_stats: OverallStats;
    subject_stats: AttendanceStats[];
    currentStats: { overall_stats: OverallStats; subject_stats: AttendanceStats[] } | null;
    periodsToMiss: number;
  } | null>(null);

  // Check if a date falls within any CAT exam period
  const isInCATExamPeriod = (dateStr: string): boolean => {
    if (!data?.semester_config?.cat_periods) return false;
    
    const date = parseISO(dateStr);
    
    for (const cat of data.semester_config.cat_periods) {
      const catStart = parseISO(cat.start_date);
      const catEnd = parseISO(cat.end_date);
      
      if (date >= catStart && date <= catEnd) {
        return true;
      }
    }
    
    return false;
  };

  // Get CAT period name for a date
  const getCATName = (dateStr: string): string | undefined => {
    if (!data?.semester_config?.cat_periods) return undefined;
    
    const date = parseISO(dateStr);
    
    for (const cat of data.semester_config.cat_periods) {
      const catStart = parseISO(cat.start_date);
      const catEnd = parseISO(cat.end_date);
      
      if (date >= catStart && date <= catEnd) {
        return cat.name;
      }
    }
    
    return undefined;
  };

  // Calculate the schedule for the selected date range
  const dateRangeSchedule = useMemo((): DaySchedule[] => {
    if (!startDate || !endDate || !data) return [];

    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      // Guard: if dates are invalid, return empty
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
      if (start > end) return [];

      const days = eachDayOfInterval({ start, end });
      const holidayDates = new Set(data.holidays.map((h) => h.date));

      return days.map((day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayName = dayIndexToName(getDay(day));
        const isCATDay = isInCATExamPeriod(dateStr);
        const isHolidayOrNoClass = holidayDates.has(dateStr) || dayName === 'Sunday' || isCATDay;
        const holidayInfo = data.holidays.find((h) => h.date === dateStr);
        const catName = getCATName(dateStr);

        // Get slots for this day
        const slots = data.timetable
          .filter((slot) => slot.day_of_week === dayName)
          .sort((a, b) => a.period_number - b.period_number);

        return {
          date: dateStr,
          dayName,
          slots: isHolidayOrNoClass ? [] : slots,
          isHoliday: isHolidayOrNoClass,
          holidayDescription: catName || holidayInfo?.description || (dayName === 'Sunday' ? 'Sunday' : undefined),
        };
      });
    } catch {
      return [];
    }
  }, [startDate, endDate, data]);

  // Calculate total periods that would be missed
  const totalPeriodsToMiss = useMemo(() => {
    return dateRangeSchedule.reduce((sum, day) => sum + day.slots.length, 0);
  }, [dateRangeSchedule]);

  // Get unique subjects in the date range
  const subjectsInRange = useMemo(() => {
    const subjectSet = new Set<string>();
    dateRangeSchedule.forEach((day) => {
      day.slots.forEach((slot) => {
        if (slot.subject_code) {
          subjectSet.add(slot.subject_code);
        }
      });
    });
    return Array.from(subjectSet);
  }, [dateRangeSchedule]);

  const handleSimulate = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (subjectsInRange.length === 0) {
      alert('No classes scheduled in the selected date range');
      return;
    }

    // Get projected stats assuming 100% attendance up to leave end date (no leave taken)
    // This gives us the "what if I don't take leave" baseline
    const projectedStatsIfNoLeave = getStats(endDate);

    // Simulate with all subjects that have classes in the range
    // This gives us "what if I take leave" stats
    const result = simulateLeaveImpact(startDate, endDate, subjectsInRange);
    
    if (result) {
      setSimResult({
        ...result,
        currentStats: projectedStatsIfNoLeave,
        periodsToMiss: totalPeriodsToMiss,
      });
    }
  };

  const getRiskStatus = (percentage: number, isOverall: boolean) => {
    if (isOverall) {
      if (percentage >= 82) return { color: 'green', text: 'Safe' };
      if (percentage >= 80) return { color: 'yellow', text: 'At Risk' };
      return { color: 'red', text: 'Ineligible' };
    } else {
      if (percentage >= 77) return { color: 'green', text: 'Safe' };
      if (percentage >= 75) return { color: 'yellow', text: 'At Risk' };
      return { color: 'red', text: 'Below Minimum' };
    }
  };

  if (!data || data.subjects.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 text-center">
        <p className="text-yellow-900 dark:text-yellow-200">Please set up your timetable first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Leave Impact Simulator</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">
          See how taking leave affects your attendance. The simulation assumes you'll attend all classes between today and your leave dates.
        </p>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSimResult(null);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSimResult(null);
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Schedule Preview */}
        {dateRangeSchedule.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Classes You Would Miss</h3>
              <span className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                {totalPeriodsToMiss} period{totalPeriodsToMiss !== 1 ? 's' : ''} total
              </span>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              {dateRangeSchedule.map((day) => (
                <div
                  key={day.date}
                  className={`p-3 rounded-lg ${
                    day.isHoliday
                      ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700'
                      : day.slots.length === 0
                      ? 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                      : 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {format(parseISO(day.date), 'EEE, MMM d')}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{day.dayName}</p>
                    </div>
                    {day.isHoliday ? (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {day.holidayDescription || 'Holiday'}
                      </span>
                    ) : day.slots.length === 0 ? (
                      <span className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                        No Classes
                      </span>
                    ) : (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        {day.slots.length} period{day.slots.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  
                  {day.slots.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {day.slots.map((slot) => (
                        <span
                          key={slot.id}
                          className="inline-flex items-center bg-white dark:bg-gray-800 border border-orange-300 dark:border-orange-600 text-orange-800 dark:text-orange-300 text-xs px-2 py-1 rounded"
                        >
                          <span className="font-medium">P{slot.period_number}:</span>
                          <span className="ml-1">{slot.subject_code || 'N/A'}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Summary:</strong> You would miss{' '}
                <span className="font-bold text-blue-700 dark:text-blue-400">{totalPeriodsToMiss} periods</span> across{' '}
                <span className="font-bold text-blue-700 dark:text-blue-400">{subjectsInRange.length} subjects</span>:{' '}
                {subjectsInRange.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Simulate Button */}
        <button
          onClick={handleSimulate}
          disabled={totalPeriodsToMiss === 0}
          className={`w-full font-bold py-3 rounded-lg transition-colors ${
            totalPeriodsToMiss === 0
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Calculate Attendance Impact
        </button>
      </div>

      {/* Results */}
      {simResult && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Impact Analysis</h3>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Projected Attendance (if no leave) */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-gray-400 dark:border-gray-500">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">If You Don't Take Leave</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {simResult.currentStats?.overall_stats.percentage || 100}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Projected by {endDate}</p>
              </div>

              {/* After Leave */}
              <div className={`p-4 rounded-lg border-l-4 ${
                getRiskStatus(simResult.overall_stats.percentage, true).color === 'green'
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-500'
                  : getRiskStatus(simResult.overall_stats.percentage, true).color === 'yellow'
                  ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-500'
                  : 'bg-red-50 dark:bg-red-900/30 border-red-500'
              }`}>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">If You Take Leave</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {simResult.overall_stats.percentage}%
                  </p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                      getRiskStatus(simResult.overall_stats.percentage, true).color === 'green'
                        ? 'bg-green-500'
                        : getRiskStatus(simResult.overall_stats.percentage, true).color === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  >
                    {getRiskStatus(simResult.overall_stats.percentage, true).text}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Drop of {(simResult.currentStats?.overall_stats.percentage || 100) - simResult.overall_stats.percentage}%
                </p>
              </div>
            </div>

            {/* Per-Subject Impact */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Per-Subject Impact</h4>
              {simResult.subject_stats
                .filter((stat) => subjectsInRange.includes(stat.subject_code || ''))
                .map((stat) => {
                  const risk = getRiskStatus(stat.percentage, false);
                  const currentStat = simResult.currentStats?.subject_stats.find(
                    (s) => s.subject_code === stat.subject_code
                  );
                  const drop = (currentStat?.percentage || 100) - stat.percentage;
                  
                  return (
                    <div key={stat.subject_code || stat.subject_name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{stat.subject_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{stat.subject_code || '—'}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{currentStat?.percentage || 100}%</span>
                            <span className="text-gray-400 dark:text-gray-500">→</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stat.percentage}%</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-red-600">-{drop}%</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white ${
                                risk.color === 'green'
                                  ? 'bg-green-500'
                                  : risk.color === 'yellow'
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                            >
                              {risk.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Warnings */}
          {simResult.subject_stats.some((s) => s.percentage < 75) && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-900 dark:text-red-100 font-semibold">⚠️ Warning</p>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1">
                This leave would make you ineligible for exams in one or more subjects. Consider
                reducing the leave period.
              </p>
            </div>
          )}

          {simResult.overall_stats.percentage < 80 && (
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
              <p className="text-orange-900 dark:text-orange-100 font-semibold">⚠️ Overall Attendance Alert</p>
              <p className="text-orange-800 dark:text-orange-300 text-sm mt-1">
                Your overall attendance would drop below 80%. This is below the minimum threshold.
              </p>
            </div>
          )}

          {/* How It's Calculated Section */}
          <details className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <summary className="p-4 cursor-pointer text-blue-900 dark:text-blue-100 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors">
              ℹ️ How is this calculated?
            </summary>
            <div className="px-4 pb-4 text-sm text-blue-800 dark:text-blue-200 space-y-3">
              <p>
                Both scenarios are projected to the <strong>same end date</strong> (your leave end date) 
                for a fair comparison:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                  <div>
                    <strong>"If You Don't Take Leave"</strong> — Assumes you attend 100% of classes 
                    from today until your leave end date (no absences).
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">✗</span>
                  <div>
                    <strong>"If You Take Leave"</strong> — Assumes you attend classes from today until 
                    your leave starts, then marks you absent for classes during your leave period.
                  </div>
                </div>
              </div>
              <p className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded text-blue-900 dark:text-blue-100">
                <strong>Example:</strong> If today is Jan 1 and you plan leave from Jan 10-12, both 
                scenarios count Jan 1-9 as present. The difference is only on Jan 10-12 (leave days).
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
