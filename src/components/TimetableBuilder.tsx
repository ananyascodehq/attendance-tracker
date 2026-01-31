'use client';

import { useState } from 'react';
import { TimetableSlot, Subject } from '@/types';

interface TimetableBuilderProps {
  timetable: TimetableSlot[];
  subjects: Subject[];
  onUpdate: (timetable: TimetableSlot[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const PERIODS = [1, 2, 3, 4, 5, 6, 7] as const;

// Fixed period timings
const PERIOD_TIMES: Record<number, { start: string; end: string; duration: number }> = {
  1: { start: '08:30', end: '09:20', duration: 50/60 },
  2: { start: '09:20', end: '10:10', duration: 50/60 },
  3: { start: '10:25', end: '11:15', duration: 50/60 },
  4: { start: '11:15', end: '12:05', duration: 50/60 },
  5: { start: '12:45', end: '13:35', duration: 50/60 },
  6: { start: '13:35', end: '14:25', duration: 50/60 },
  7: { start: '14:25', end: '15:15', duration: 50/60 },
};

interface DraggedData {
  type: 'subject' | 'slot';
  subject_code?: string;
  slot?: TimetableSlot;
}

export default function TimetableBuilder({
  timetable,
  subjects,
  onUpdate,
}: TimetableBuilderProps) {
  const [draggedData, setDraggedData] = useState<DraggedData | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const getSlotForPosition = (day: string, period: number): TimetableSlot | null => {
    return timetable.find(
      (slot) =>
        slot.day_of_week === day &&
        slot.period_number === period
    ) || null;
  };

  const isLabSubject = (subjectCode: string): boolean => {
    const subject = subjects.find((s) => s.subject_code === subjectCode);
    return subject ? subject.subject_name.toLowerCase().includes('lab') : false;
  };

  const canFitConsecutivePeriods = (day: string, startPeriod: number, count: number): boolean => {
    for (let i = 0; i < count; i++) {
      const periodNum = startPeriod + i;
      if (periodNum > 7) return false; // Out of bounds
      if (getSlotForPosition(day, periodNum) !== null) return false; // Already occupied
    }
    return true;
  };

  const handleDropOnCell = (day: string, period: number) => {
    if (!draggedData) return;

    if (draggedData.type === 'subject') {
      // Dragging from subject palette
      const isLab = isLabSubject(draggedData.subject_code!);
      const periodsNeeded = isLab ? 3 : 1;

      // Check if we can fit the required periods
      if (!canFitConsecutivePeriods(day, period, periodsNeeded)) {
        alert(
          isLab
            ? `Lab class needs 3 consecutive periods. Cannot fit starting from period ${period}.`
            : `Period ${period} is already occupied.`
        );
        setDraggedData(null);
        return;
      }

      // Create slots for all periods
      let updated = timetable.filter(
        (slot) => slot.day_of_week !== day || !PERIODS.slice(period - 1, period - 1 + periodsNeeded).includes(slot.period_number as any)
      );

      for (let i = 0; i < periodsNeeded; i++) {
        const currentPeriod = period + i;
        const periodTime = PERIOD_TIMES[currentPeriod];
        
        const newSlot: TimetableSlot = {
          id: `${day}-${currentPeriod}`,
          day_of_week: day as any,
          period_number: currentPeriod as any,
          subject_code: draggedData.subject_code!,
          start_time: periodTime.start,
          end_time: periodTime.end,
          duration_hours: periodTime.duration,
        };
        updated = [...updated, newSlot];
      }

      onUpdate(updated);
    } else if (draggedData.type === 'slot' && draggedData.slot) {
      // Moving existing slot - preserve lab behavior
      const isLab = isLabSubject(draggedData.slot.subject_code);
      const periodsNeeded = isLab ? 3 : 1;

      // Remove all periods of this slot from original position
      let updated = timetable.filter((s) => s.subject_code !== draggedData.slot!.subject_code || s.day_of_week !== draggedData.slot!.day_of_week);

      // Check if we can fit at new position
      if (!canFitConsecutivePeriods(day, period, periodsNeeded)) {
        alert(
          isLab
            ? `Lab class needs 3 consecutive periods. Cannot fit starting from period ${period}.`
            : `Period ${period} is already occupied.`
        );
        setDraggedData(null);
        return;
      }

      // Add slots at new position
      for (let i = 0; i < periodsNeeded; i++) {
        const currentPeriod = period + i;
        const periodTime = PERIOD_TIMES[currentPeriod];
        
        const movedSlot: TimetableSlot = {
          id: `${day}-${currentPeriod}`,
          day_of_week: day as any,
          period_number: currentPeriod as any,
          subject_code: draggedData.slot.subject_code,
          start_time: periodTime.start,
          end_time: periodTime.end,
          duration_hours: periodTime.duration,
        };
        updated = [...updated, movedSlot];
      }

      onUpdate(updated);
    }

    setDraggedData(null);
    setDragOverCell(null);
  };

  const deleteSlot = (id: string) => {
    onUpdate(timetable.filter((slot) => slot.id !== id));
  };

  const getSubjectColor = (code: string) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-900',
      'bg-green-100 border-green-300 text-green-900',
      'bg-purple-100 border-purple-300 text-purple-900',
      'bg-pink-100 border-pink-300 text-pink-900',
      'bg-yellow-100 border-yellow-300 text-yellow-900',
      'bg-indigo-100 border-indigo-300 text-indigo-900',
    ];
    const subjectIndex = subjects.findIndex((s) => s.subject_code === code);
    return colors[subjectIndex % colors.length];
  };

  const truncateText = (text: string, maxLength: number = 12): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 border border-blue-200">
        <p className="font-semibold mb-2">📌 How to use:</p>
        <ul className="text-xs space-y-1">
          <li>• Drag any <strong>color-coded subject card</strong> from above and drop it on a time slot</li>
          <li>• <strong>Lab classes</strong> automatically fill 3 consecutive periods</li>
          <li>• Drag <strong>existing classes</strong> within the grid to reschedule them</li>
          <li>• Click the <strong>×</strong> button to delete a class</li>
        </ul>
      </div>

      {/* Subject Palette - Top Horizontal */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Subjects</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {subjects.map((subject) => (
            <div
              key={subject.subject_code}
              draggable
              onDragStart={() =>
                setDraggedData({ type: 'subject', subject_code: subject.subject_code })
              }
              onDragEnd={() => setDraggedData(null)}
              className={`${getSubjectColor(
                subject.subject_code
              )} border-2 p-3 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow`}
            >
              <div className="font-bold text-sm">{subject.subject_code}</div>
              <div className="text-xs leading-tight mt-1">{truncateText(subject.subject_name, 15)}</div>
              {isLabSubject(subject.subject_code) && (
                <div className="text-xs mt-2 font-semibold text-orange-600">🔬 Lab</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="bg-gray-100 border px-4 py-3 font-semibold text-left w-28">Day</th>
                {PERIODS.map((period) => (
                  <th
                    key={period}
                    className="bg-gray-100 border px-2 py-2 font-semibold text-center"
                  >
                    <div className="text-base">{period}</div>
                    <div className="text-xs font-normal text-gray-500">
                      {formatTime(PERIOD_TIMES[period].start)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="bg-gray-50 border px-4 py-2 font-semibold">{day}</td>
                    {PERIODS.map((period) => {
                      const slot = getSlotForPosition(day, period);
                      const cellId = `${day}-${period}`;
                      const isHovered = dragOverCell === cellId && draggedData;

                      return (
                        <td
                          key={cellId}
                          className={`border p-0 h-24 relative align-top transition-all ${
                            isHovered ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-50'
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverCell(cellId);
                          }}
                          onDragLeave={() => setDragOverCell(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDropOnCell(day, period);
                          }}
                        >
                          {slot ? (
                            <div
                              draggable
                              onDragStart={() =>
                                setDraggedData({ type: 'slot', slot })
                              }
                              onDragEnd={() => setDraggedData(null)}
                              className={`${getSubjectColor(
                                slot.subject_code
                              )} border-2 p-2 h-full cursor-move hover:shadow-md transition-shadow flex flex-col justify-between group`}
                            >
                              <div>
                                <div className="text-xs font-bold">{slot.subject_code}</div>
                                <div className="text-xs leading-tight">
                                  {truncateText(
                                    subjects.find((s) => s.subject_code === slot.subject_code)
                                      ?.subject_name || '',
                                    12
                                  )}
                                </div>
                                {isLabSubject(slot.subject_code) && (
                                  <div className="text-xs mt-1 font-semibold text-orange-600">🔬 Lab</div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSlot(slot.id);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="h-full text-gray-300 text-xs flex items-center justify-center">
                              {isHovered ? '↓ Drop here' : '-'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          <div className="bg-gray-50 rounded-lg p-4 text-sm mt-6">
            <div className="font-medium mb-2">Period Times:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
              <div>1: 8:30 - 9:20 AM</div>
              <div>2: 9:20 - 10:10 AM</div>
              <div className="text-orange-600">Break: 10:10 - 10:25</div>
              <div>3: 10:25 - 11:15 AM</div>
              <div>4: 11:15 AM - 12:05 PM</div>
              <div className="text-orange-600">Lunch: 12:05 - 12:45</div>
              <div>5: 12:45 - 1:35 PM</div>
              <div>6: 1:35 - 2:25 PM</div>
              <div>7: 2:25 - 3:15 PM</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
