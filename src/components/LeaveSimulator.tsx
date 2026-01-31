'use client';

import { useState } from 'react';
import { AttendanceStats } from '@/types';

interface LeaveSimulatorProps {
  stats: AttendanceStats[];
}

export const LeaveSimulator = ({ stats }: LeaveSimulatorProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [simulatedStats, setSimulatedStats] = useState<AttendanceStats[] | null>(null);

  const handleSimulate = () => {
    // Simplified simulation logic
    // In production, this would calculate affected classes and update attendance percentages
    const simulated = stats.map((s) => ({
      ...s,
      percentage: Math.max(75, s.percentage - 2),
    }));
    setSimulatedStats(simulated);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Leave Impact Simulator</h2>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Leave Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Leave End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <button
          onClick={handleSimulate}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Simulate Leave Impact
        </button>
      </div>

      {simulatedStats && (
        <div className="space-y-2">
          <h3 className="font-semibold">Impact Preview:</h3>
          {simulatedStats.map((s) => (
            <div key={s.subject_code} className="p-3 bg-gray-50 rounded-lg text-sm">
              <p>{s.subject_name}</p>
              <p className="text-gray-600">
                {s.percentage}% ({s.percentage < 75 ? '❌ Below threshold' : '✓ Safe'})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
