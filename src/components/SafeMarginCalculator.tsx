'use client';

import { AttendanceStats } from '@/types';
import { calculateSafeMargin } from '@/lib/calculations';

interface SafeMarginCalculatorProps {
  stats: AttendanceStats[];
  semesterEndDate: string;
}

export const SafeMarginCalculator = ({
  stats,
  semesterEndDate,
}: SafeMarginCalculatorProps) => {
  const getWeeksLeft = (): number => {
    const today = new Date();
    const endDate = new Date(semesterEndDate);
    const daysLeft = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return Math.ceil(daysLeft / 7);
  };

  const weeksLeft = getWeeksLeft();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Safe Absence Margin</h2>
      <p className="text-sm text-gray-600 mb-4">{weeksLeft} weeks remaining in semester</p>

      <div className="space-y-4">
        {stats.map((subject) => {
          const futureClasses = subject.credits * weeksLeft;
          const safeAbsences = calculateSafeMargin(
            subject.present,
            subject.total_classes,
            futureClasses
          );

          return (
            <div key={subject.subject_code} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{subject.subject_name}</p>
                  <p className="text-xs text-gray-500">{subject.subject_code}</p>
                </div>
                <span className="text-lg font-bold text-blue-600">{safeAbsences}</span>
              </div>
              <p className="text-xs text-gray-600">
                Can skip {safeAbsences} out of {futureClasses} remaining classes
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
