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

    // Get current stats before simulation
    const currentStats = getStats();

    // Simulate with all subjects that have classes in the range
    const result = simulateLeaveImpact(startDate, endDate, subjectsInRange);
    
    if (result) {
      setSimResult({
        ...result,
        currentStats,
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-900">Please set up your timetable first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Impact Simulator</h2>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSimResult(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSimResult(null);
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Schedule Preview */}
        {dateRangeSchedule.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Classes You Would Miss</h3>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {totalPeriodsToMiss} period{totalPeriodsToMiss !== 1 ? 's' : ''} total
              </span>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {dateRangeSchedule.map((day) => (
                <div
                  key={day.date}
                  className={`p-3 rounded-lg ${
                    day.isHoliday
                      ? 'bg-green-50 border border-green-200'
                      : day.slots.length === 0
                      ? 'bg-gray-50 border border-gray-200'
                      : 'bg-orange-50 border border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {format(parseISO(day.date), 'EEE, MMM d')}
                      </p>
                      <p className="text-xs text-gray-600">{day.dayName}</p>
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
                          className="inline-flex items-center bg-white border border-orange-300 text-orange-800 text-xs px-2 py-1 rounded"
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
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Summary:</strong> You would miss{' '}
                <span className="font-bold text-blue-700">{totalPeriodsToMiss} periods</span> across{' '}
                <span className="font-bold text-blue-700">{subjectsInRange.length} subjects</span>:{' '}
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
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Calculate Attendance Impact
        </button>
      </div>

      {/* Results */}
      {simResult && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Impact Analysis</h3>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Current Attendance */}
              <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                <p className="text-sm text-gray-600 mb-1">Current Attendance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {simResult.currentStats?.overall_stats.percentage || 100}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Before taking leave</p>
              </div>

              {/* After Leave */}
              <div className={`p-4 rounded-lg border-l-4 ${
                getRiskStatus(simResult.overall_stats.percentage, true).color === 'green'
                  ? 'bg-green-50 border-green-500'
                  : getRiskStatus(simResult.overall_stats.percentage, true).color === 'yellow'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-red-50 border-red-500'
              }`}>
                <p className="text-sm text-gray-600 mb-1">After Leave</p>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold text-gray-900">
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
                <p className="text-xs text-gray-500 mt-1">
                  Drop of {(simResult.currentStats?.overall_stats.percentage || 100) - simResult.overall_stats.percentage}%
                </p>
              </div>
            </div>

            {/* Per-Subject Impact */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Per-Subject Impact</h4>
              {simResult.subject_stats
                .filter((stat) => subjectsInRange.includes(stat.subject_code || ''))
                .map((stat) => {
                  const risk = getRiskStatus(stat.percentage, false);
                  const currentStat = simResult.currentStats?.subject_stats.find(
                    (s) => s.subject_code === stat.subject_code
                  );
                  const drop = (currentStat?.percentage || 100) - stat.percentage;
                  
                  return (
                    <div key={stat.subject_code || stat.subject_name} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{stat.subject_name}</p>
                          <p className="text-sm text-gray-600">{stat.subject_code || '—'}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{currentStat?.percentage || 100}%</span>
                            <span className="text-gray-400">→</span>
                            <span className="text-2xl font-bold text-gray-900">{stat.percentage}%</span>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900 font-semibold">⚠️ Warning</p>
              <p className="text-red-800 text-sm mt-1">
                This leave would make you ineligible for exams in one or more subjects. Consider
                reducing the leave period.
              </p>
            </div>
          )}

          {simResult.overall_stats.percentage < 80 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-900 font-semibold">⚠️ Overall Attendance Alert</p>
              <p className="text-orange-800 text-sm mt-1">
                Your overall attendance would drop below 80%. This is below the minimum threshold.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
