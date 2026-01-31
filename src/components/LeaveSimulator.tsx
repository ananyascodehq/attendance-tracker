'use client';

import { useState } from 'react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { OverallStats, AttendanceStats } from '@/types';

export const LeaveSimulator = () => {
  const { data, simulateLeaveImpact } = useAttendanceData();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [simResult, setSimResult] = useState<{
    overall_stats: OverallStats;
    subject_stats: AttendanceStats[];
  } | null>(null);

  const handleSubjectToggle = (subjectCode: string) => {
    const newSet = new Set(selectedSubjects);
    if (newSet.has(subjectCode)) {
      newSet.delete(subjectCode);
    } else {
      newSet.add(subjectCode);
    }
    setSelectedSubjects(newSet);
  };

  const handleSimulate = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (selectedSubjects.size === 0) {
      alert('Please select at least one subject');
      return;
    }

    const result = simulateLeaveImpact(startDate, endDate, Array.from(selectedSubjects));
    setSimResult(result);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Simulate Leave Impact</h2>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Subject Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Subjects
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.subjects.map((subject) => (
              <label
                key={subject.subject_code}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedSubjects.has(subject.subject_code)}
                  onChange={() => handleSubjectToggle(subject.subject_code)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{subject.subject_name}</p>
                  <p className="text-xs text-gray-500">{subject.subject_code}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Simulate Button */}
        <button
          onClick={handleSimulate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Simulate
        </button>
      </div>

      {/* Results */}
      {simResult && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Simulation Results</h3>

            {/* Overall Stats */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Overall Attendance After Leave</p>
              <div className="flex items-center justify-between">
                <p className="text-4xl font-bold text-gray-900">
                  {simResult.overall_stats.percentage}%
                </p>
                <span
                  className={`px-4 py-2 rounded-lg font-semibold text-white ${
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
            </div>

            {/* Per-Subject Stats */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Per-Subject Impact</h4>
              {simResult.subject_stats.map((stat) => {
                const risk = getRiskStatus(stat.percentage, false);
                return (
                  <div key={stat.subject_code} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{stat.subject_name}</p>
                        <p className="text-sm text-gray-600">{stat.subject_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{stat.percentage}%</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white mt-1 ${
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
                );
              })}
            </div>
          </div>

          {/* Warning if any subject fails */}
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
