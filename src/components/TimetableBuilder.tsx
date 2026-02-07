'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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

// Same color palette as SubjectsManager - 20 unique colors
const subjectColors = [
  { bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'border-rose-300 dark:border-rose-700', text: 'text-rose-900 dark:text-rose-300' },
  { bg: 'bg-sky-100 dark:bg-sky-900/30', border: 'border-sky-300 dark:border-sky-700', text: 'text-sky-900 dark:text-sky-300' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-900 dark:text-amber-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-900 dark:text-emerald-300' },
  { bg: 'bg-violet-100 dark:bg-violet-900/30', border: 'border-violet-300 dark:border-violet-700', text: 'text-violet-900 dark:text-violet-300' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-300 dark:border-cyan-700', text: 'text-cyan-900 dark:text-cyan-300' },
  { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-900 dark:text-orange-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-900 dark:text-teal-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-900 dark:text-pink-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/30', border: 'border-indigo-300 dark:border-indigo-700', text: 'text-indigo-900 dark:text-indigo-300' },
  { bg: 'bg-lime-100 dark:bg-lime-900/30', border: 'border-lime-300 dark:border-lime-700', text: 'text-lime-900 dark:text-lime-300' },
  { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', border: 'border-fuchsia-300 dark:border-fuchsia-700', text: 'text-fuchsia-900 dark:text-fuchsia-300' },
  { bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700', text: 'text-red-900 dark:text-red-300' },
  { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-900 dark:text-blue-300' },
  { bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-900 dark:text-yellow-300' },
  { bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700', text: 'text-green-900 dark:text-green-300' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-900 dark:text-purple-300' },
  { bg: 'bg-stone-100 dark:bg-stone-900/30', border: 'border-stone-300 dark:border-stone-700', text: 'text-stone-900 dark:text-stone-300' },
  { bg: 'bg-slate-100 dark:bg-slate-900/30', border: 'border-slate-300 dark:border-slate-700', text: 'text-slate-900 dark:text-slate-300' },
  { bg: 'bg-zinc-100 dark:bg-zinc-900/30', border: 'border-zinc-300 dark:border-zinc-700', text: 'text-zinc-900 dark:text-zinc-300' },
];

// Same hash function as SubjectsManager for consistency
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

interface DraggedData {
  type: 'subject' | 'slot';
  subject_code?: string;
  subject_name?: string;
  slot?: TimetableSlot;
}

// SVG Icons for subject types
const BeakerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const AcademicCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function TimetableBuilder({
  timetable,
  subjects,
  onUpdate,
}: TimetableBuilderProps) {
  // ── Local draft state (only saved on explicit Save) ──
  const [draft, setDraft] = useState<TimetableSlot[]>(timetable);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync draft when props change externally (e.g. initial load, realtime update)
  useEffect(() => {
    if (!hasChanges) {
      setDraft(timetable);
    }
  }, [timetable, hasChanges]);

  // Wrapper: update draft locally (not Supabase)
  const updateDraft = useCallback((updated: TimetableSlot[]) => {
    setDraft(updated);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      onUpdate(draft);
      setHasChanges(false);
    } finally {
      // Small delay so the user sees feedback
      setTimeout(() => setSaving(false), 400);
    }
  }, [draft, onUpdate]);

  const handleDiscard = useCallback(() => {
    setDraft(timetable);
    setHasChanges(false);
  }, [timetable]);

  const [draggedData, setDraggedData] = useState<DraggedData | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  // Mobile tap-to-place mode
  const [selectedSubject, setSelectedSubject] = useState<{ code?: string; name?: string } | null>(null);

  const getSlotForPosition = (day: string, period: number): TimetableSlot | null => {
    return draft.find(
      (slot) =>
        slot.day_of_week === day &&
        slot.period_number === period
    ) || null;
  };

  // Find subject by code or name (for Library/Seminar which use name as identifier)
  const findSubject = (identifier: string | undefined): Subject | undefined => {
    if (!identifier) return undefined;
    return subjects.find((s) => s.subject_code === identifier || s.subject_name === identifier);
  };

  const isLabSubject = (identifier: string | undefined): boolean => {
    const subject = findSubject(identifier);
    return subject ? subject.subject_name.toLowerCase().includes('lab') : false;
  };

  const isVACSubject = (identifier: string | undefined): boolean => {
    const subject = findSubject(identifier);
    return subject ? subject.zero_credit_type === 'vac' : false;
  };

  const isLibrarySubject = (identifier: string | undefined): boolean => {
    const subject = findSubject(identifier);
    return subject ? subject.zero_credit_type === 'library' : false;
  };

  const isSeminarSubject = (identifier: string | undefined): boolean => {
    const subject = findSubject(identifier);
    return subject ? subject.zero_credit_type === 'seminar' : false;
  };

  const getSubjectDisplayName = (identifier: string | undefined): string => {
    const subject = findSubject(identifier);
    if (!subject) return identifier || 'Unknown';
    return subject.subject_code ? `${subject.subject_code} - ${subject.subject_name}` : subject.subject_name;
  };

  const canFitConsecutivePeriods = (day: string, startPeriod: number, count: number): boolean => {
    for (let i = 0; i < count; i++) {
      const periodNum = startPeriod + i;
      if (periodNum > 7) return false; // Out of bounds
      if (getSlotForPosition(day, periodNum) !== null) return false; // Already occupied
    }
    return true;
  };

  // Direct placement function for mobile tap-to-place (doesn't rely on state)
  const placeSubjectInCell = (day: string, period: number, subjectCode?: string, subjectName?: string) => {
    const identifier = subjectCode || subjectName;
    const isLab = isLabSubject(identifier);
    const isVAC = isVACSubject(identifier);
    const periodsNeeded = isLab ? 3 : isVAC ? 2 : 1;

    // Check if we can fit the required periods
    if (!canFitConsecutivePeriods(day, period, periodsNeeded)) {
      alert(
        isLab
          ? `Lab class needs 3 consecutive periods. Cannot fit starting from period ${period}.`
          : isVAC
          ? `VAC needs 2 consecutive periods. Cannot fit starting from period ${period}.`
          : `Period ${period} is already occupied.`
      );
      return;
    }

    // Create slots for all periods
    let updated = draft.filter(
      (slot) => slot.day_of_week !== day || !PERIODS.slice(period - 1, period - 1 + periodsNeeded).includes(slot.period_number as any)
    );

    for (let i = 0; i < periodsNeeded; i++) {
      const currentPeriod = period + i;
      const periodTime = PERIOD_TIMES[currentPeriod];
      const subjectIdentifier = identifier || 'unknown';
      
      const newSlot: TimetableSlot = {
        id: `${day}-${currentPeriod}-${subjectIdentifier}`,
        day_of_week: day as any,
        period_number: currentPeriod as any,
        subject_code: subjectIdentifier,
        start_time: periodTime.start,
        end_time: periodTime.end,
        duration_hours: periodTime.duration,
      };
      updated = [...updated, newSlot];
    }

    updateDraft(updated);
  };

  const handleDropOnCell = (day: string, period: number) => {
    if (!draggedData) return;

    if (draggedData.type === 'subject') {
      // Dragging from subject palette
      const isLab = isLabSubject(draggedData.subject_code!);
      const isVAC = isVACSubject(draggedData.subject_code!);
      const periodsNeeded = isLab ? 3 : isVAC ? 2 : 1;

      // Check if we can fit the required periods
      if (!canFitConsecutivePeriods(day, period, periodsNeeded)) {
        alert(
          isLab
            ? `Lab class needs 3 consecutive periods. Cannot fit starting from period ${period}.`
            : isVAC
            ? `VAC needs 2 consecutive periods. Cannot fit starting from period ${period}.`
            : `Period ${period} is already occupied.`
        );
        setDraggedData(null);
        return;
      }

      // Create slots for all periods
      let updated = draft.filter(
        (slot) => slot.day_of_week !== day || !PERIODS.slice(period - 1, period - 1 + periodsNeeded).includes(slot.period_number as any)
      );

      for (let i = 0; i < periodsNeeded; i++) {
        const currentPeriod = period + i;
        const periodTime = PERIOD_TIMES[currentPeriod];
        // Use subject_name as identifier for Library/Seminar (which have no code)
        const subjectIdentifier = draggedData.subject_code || draggedData.subject_name || 'unknown';
        
        const newSlot: TimetableSlot = {
          id: `${day}-${currentPeriod}-${subjectIdentifier}`,
          day_of_week: day as any,
          period_number: currentPeriod as any,
          subject_code: subjectIdentifier, // Use identifier (code or name) for lookup
          start_time: periodTime.start,
          end_time: periodTime.end,
          duration_hours: periodTime.duration,
        };
        updated = [...updated, newSlot];
      }

      updateDraft(updated);
    } else if (draggedData.type === 'slot' && draggedData.slot) {
      // Moving existing slot - preserve lab/VAC behavior
      const isLab = isLabSubject(draggedData.slot.subject_code);
      const isVAC = isVACSubject(draggedData.slot.subject_code);
      const periodsNeeded = isLab ? 3 : isVAC ? 2 : 1;

      // Remove all periods of this slot from original position
      let updated = draft.filter((s) => s.subject_code !== draggedData.slot!.subject_code || s.day_of_week !== draggedData.slot!.day_of_week);

      // Check if we can fit at new position
      if (!canFitConsecutivePeriods(day, period, periodsNeeded)) {
        alert(
          isLab
            ? `Lab class needs 3 consecutive periods. Cannot fit starting from period ${period}.`
            : isVAC
            ? `VAC needs 2 consecutive periods. Cannot fit starting from period ${period}.`
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

      updateDraft(updated);
    }

    setDraggedData(null);
    setDragOverCell(null);
  };

  const deleteSlot = (id: string) => {
    updateDraft(draft.filter((slot) => slot.id !== id));
  };

  // Build color map using same logic as SubjectsManager for consistency
  const colorMap = useMemo(() => {
    const usedIndices = new Set<number>();
    const map = new Map<string, typeof subjectColors[0]>();
    
    subjects.forEach((subject) => {
      const key = subject.subject_code || subject.subject_name;
      const hash = hashString(key);
      let colorIndex = hash % subjectColors.length;
      
      // Find next available color if this one is taken
      let attempts = 0;
      while (usedIndices.has(colorIndex) && attempts < subjectColors.length) {
        colorIndex = (colorIndex + 1) % subjectColors.length;
        attempts++;
      }
      
      usedIndices.add(colorIndex);
      map.set(key, subjectColors[colorIndex]);
    });
    
    return map;
  }, [subjects]);

  const getSubjectColor = (code: string | undefined) => {
    if (!code) return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white';
    const colors = colorMap.get(code);
    if (colors) {
      return `${colors.bg} ${colors.border} ${colors.text}`;
    }
    // Fallback for subjects not in the list
    return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white';
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
      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
        <p className="font-semibold mb-2">📌 How to use:</p>
        <ul className="text-xs space-y-1">
          <li>• <strong>Desktop:</strong> Drag subject cards and drop them on time slots</li>
          <li>• <strong>Mobile:</strong> Tap a subject to select it, then tap a time slot to place it</li>
          <li>• <strong>Lab classes</strong> automatically fill 3 consecutive periods</li>
          <li>• <strong>VAC courses</strong> automatically fill 2 consecutive periods</li>
          <li>• Click the <strong>×</strong> button to delete a class</li>
        </ul>
      </div>

      {/* Save / Discard bar */}
      {hasChanges && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3 flex items-center justify-between gap-3 animate-in">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            You have unsaved changes
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscard}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white spinner-smooth" />
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Save Timetable
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Selected Subject Indicator for Mobile */}
      {selectedSubject && (
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-sm text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700 flex items-center justify-between">
          <span>
            <strong>Selected:</strong> {selectedSubject.code || selectedSubject.name} — Tap a time slot to place it
          </span>
          <button
            onClick={() => setSelectedSubject(null)}
            className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 font-bold px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subject Palette - Top Horizontal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Subjects</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {subjects.map((subject, index) => {
            const subjectKey = subject.subject_code || `${subject.subject_name}-${index}`;
            const selectedKey = selectedSubject?.code || selectedSubject?.name;
            const isSelected = selectedKey === (subject.subject_code || subject.subject_name);
            return (
            <div
              key={subjectKey}
              draggable
              onDragStart={() =>
                setDraggedData({ type: 'subject', subject_code: subject.subject_code, subject_name: subject.subject_name })
              }
              onDragEnd={() => setDraggedData(null)}
              onClick={(e) => {
                e.preventDefault();
                // Toggle selection for mobile tap-to-place
                if (isSelected) {
                  setSelectedSubject(null);
                } else {
                  setSelectedSubject({ code: subject.subject_code, name: subject.subject_name });
                }
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                // Toggle selection for mobile tap-to-place
                if (isSelected) {
                  setSelectedSubject(null);
                } else {
                  setSelectedSubject({ code: subject.subject_code, name: subject.subject_name });
                }
              }}
              className={`${getSubjectColor(
                subject.subject_code
              )} border-2 p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all select-none ${
                isSelected ? 'ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-800' : ''
              }`}
            >
              {subject.subject_code ? (
                <>
                  <div className="font-bold text-sm">{subject.subject_code}</div>
                  <div className="text-xs leading-tight mt-1">{truncateText(subject.subject_name, 15)}</div>
                </>
              ) : (
                <div className="text-xs font-semibold leading-tight">{truncateText(subject.subject_name, 15)}</div>
              )}
              {isLabSubject(subject.subject_code) && (
                <div className="text-xs mt-2 font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <BeakerIcon className="w-3.5 h-3.5" /> Lab
                </div>
              )}
              {isVACSubject(subject.subject_code) && (
                <div className="text-xs mt-2 font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <AcademicCapIcon className="w-3.5 h-3.5" /> VAC
                </div>
              )}
              {isLibrarySubject(subject.subject_code) && (
                <div className="text-xs mt-2 font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                  <BookOpenIcon className="w-3.5 h-3.5" /> Library
                </div>
              )}
              {isSeminarSubject(subject.subject_code) && (
                <div className="text-xs mt-2 font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <UsersIcon className="w-3.5 h-3.5" /> Seminar
                </div>
              )}
            </div>
          );
          })}
        </div>
      </div>

      {/* Timetable Grid */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-3 font-semibold text-left w-28 text-gray-900 dark:text-white">Day</th>
                {PERIODS.map((period) => (
                  <th
                    key={period}
                    className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-2 font-semibold text-center text-gray-900 dark:text-white"
                  >
                    <div className="text-base">{period}</div>
                    <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      {formatTime(PERIOD_TIMES[period].start)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                // Track which periods have already been rendered as part of a multi-period slot
                const renderedPeriods = new Set<number>();
                
                return (
                  <tr key={day}>
                    <td className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 px-4 py-2 font-semibold text-gray-900 dark:text-white">{day}</td>
                    {PERIODS.map((period) => {
                      // Skip if this period was already rendered as part of a previous multi-period slot
                      if (renderedPeriods.has(period)) {
                        return null;
                      }

                      const slot = getSlotForPosition(day, period);
                      const cellId = `${day}-${period}`;
                      const isHovered = dragOverCell === cellId && draggedData;

                      // Check if this is a multi-period slot
                      let colSpan = 1;
                      if (slot) {
                        const isLab = isLabSubject(slot.subject_code);
                        const isVAC = isVACSubject(slot.subject_code);
                        if (isLab) {
                          colSpan = 3;
                          // Mark next 2 periods as rendered
                          renderedPeriods.add(period + 1);
                          renderedPeriods.add(period + 2);
                        } else if (isVAC) {
                          colSpan = 2;
                          // Mark next period as rendered
                          renderedPeriods.add(period + 1);
                        }
                      }

                      return (
                        <td
                          key={cellId}
                          colSpan={colSpan}
                          className={`border border-gray-200 dark:border-gray-600 p-0 h-24 relative align-top transition-all cursor-pointer ${
                            isHovered ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400 dark:ring-blue-500' : ''
                          } ${selectedSubject && !slot ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverCell(cellId);
                          }}
                          onDragLeave={() => setDragOverCell(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            handleDropOnCell(day, period);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            // Handle tap-to-place for mobile
                            if (selectedSubject && !slot) {
                              placeSubjectInCell(day, period, selectedSubject.code, selectedSubject.name);
                              setSelectedSubject(null);
                            }
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            // Handle tap-to-place for mobile
                            if (selectedSubject && !slot) {
                              placeSubjectInCell(day, period, selectedSubject.code, selectedSubject.name);
                              setSelectedSubject(null);
                            }
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
                                {(() => {
                                  const subject = findSubject(slot.subject_code);
                                  // Show code + name for subjects with actual code, just name otherwise
                                  if (subject?.subject_code) {
                                    return (
                                      <>
                                        <div className="text-xs font-bold">{subject.subject_code}</div>
                                        <div className="text-xs leading-tight">
                                          {truncateText(subject.subject_name, 12)}
                                        </div>
                                      </>
                                    );
                                  } else {
                                    return (
                                      <div className="text-xs font-semibold leading-tight">
                                        {truncateText(subject?.subject_name || slot.subject_code || '', 12)}
                                      </div>
                                    );
                                  }
                                })()}
                                {isLabSubject(slot.subject_code) && (
                                  <div className="text-xs mt-1 font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                    <BeakerIcon className="w-3 h-3" /> Lab
                                  </div>
                                )}
                                {isVACSubject(slot.subject_code) && (
                                  <div className="text-xs mt-1 font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                    <AcademicCapIcon className="w-3 h-3" /> VAC
                                  </div>
                                )}
                                {isLibrarySubject(slot.subject_code) && (
                                  <div className="text-xs mt-1 font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                                    <BookOpenIcon className="w-3 h-3" /> Library
                                  </div>
                                )}
                                {isSeminarSubject(slot.subject_code) && (
                                  <div className="text-xs mt-1 font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                    <UsersIcon className="w-3 h-3" /> Seminar
                                  </div>
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
                            <div className="h-full text-gray-300 dark:text-gray-600 text-xs flex items-center justify-center">
                              {isHovered ? '↓ Drop here' : '-'}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              </tbody>
            </table>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm mt-6">
            <div className="font-medium mb-2 text-gray-900 dark:text-white">Period Times:</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-300">
              <div>1: 8:30 - 9:20 AM</div>
              <div>2: 9:20 - 10:10 AM</div>
              <div className="text-orange-600 dark:text-orange-400">Break: 10:10 - 10:25</div>
              <div>3: 10:25 - 11:15 AM</div>
              <div>4: 11:15 AM - 12:05 PM</div>
              <div className="text-orange-600 dark:text-orange-400">Lunch: 12:05 - 12:45</div>
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
