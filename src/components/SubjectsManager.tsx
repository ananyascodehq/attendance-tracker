'use client';

import { useState } from 'react';
import { Subject } from '@/types';

interface SubjectsManagerProps {
  subjects: Subject[];
  onUpdate: (subjects: Subject[]) => void;
}

// Vibrant but soft color palette for subjects - 20 unique colors
const subjectColors = [
  { bg: 'bg-rose-50 dark:bg-rose-900/30', border: 'border-rose-200 dark:border-rose-700', text: 'text-rose-700 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300' },
  { bg: 'bg-sky-50 dark:bg-sky-900/30', border: 'border-sky-200 dark:border-sky-700', text: 'text-sky-700 dark:text-sky-400', badge: 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300' },
  { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300' },
  { bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-200 dark:border-violet-700', text: 'text-violet-700 dark:text-violet-400', badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300' },
  { bg: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-200 dark:border-cyan-700', text: 'text-cyan-700 dark:text-cyan-400', badge: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300' },
  { bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-400', badge: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300' },
  { bg: 'bg-teal-50 dark:bg-teal-900/30', border: 'border-teal-200 dark:border-teal-700', text: 'text-teal-700 dark:text-teal-400', badge: 'bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300' },
  { bg: 'bg-pink-50 dark:bg-pink-900/30', border: 'border-pink-200 dark:border-pink-700', text: 'text-pink-700 dark:text-pink-400', badge: 'bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300' },
  { bg: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-700', text: 'text-indigo-700 dark:text-indigo-400', badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300' },
  { bg: 'bg-lime-50 dark:bg-lime-900/30', border: 'border-lime-200 dark:border-lime-700', text: 'text-lime-700 dark:text-lime-400', badge: 'bg-lime-100 dark:bg-lime-900/50 text-lime-800 dark:text-lime-300' },
  { bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/30', border: 'border-fuchsia-200 dark:border-fuchsia-700', text: 'text-fuchsia-700 dark:text-fuchsia-400', badge: 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-300' },
  { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-700', text: 'text-red-700 dark:text-red-400', badge: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' },
  { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300' },
  { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-700 dark:text-yellow-400', badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' },
  { bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-700', text: 'text-green-700 dark:text-green-400', badge: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' },
  { bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-400', badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300' },
  { bg: 'bg-stone-100 dark:bg-stone-900/30', border: 'border-stone-300 dark:border-stone-600', text: 'text-stone-700 dark:text-stone-400', badge: 'bg-stone-200 dark:bg-stone-900/50 text-stone-800 dark:text-stone-300' },
  { bg: 'bg-slate-100 dark:bg-slate-900/30', border: 'border-slate-300 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-400', badge: 'bg-slate-200 dark:bg-slate-900/50 text-slate-800 dark:text-slate-300' },
  { bg: 'bg-zinc-100 dark:bg-zinc-900/30', border: 'border-zinc-300 dark:border-zinc-600', text: 'text-zinc-700 dark:text-zinc-400', badge: 'bg-zinc-200 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-300' },
];

// Hash function to get consistent color based on subject identifier
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Get a unique color for each subject, avoiding duplicates within the list
const getSubjectColors = (subjects: Subject[]) => {
  const usedIndices = new Set<number>();
  const colorMap = new Map<string, typeof subjectColors[0]>();
  
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
    colorMap.set(key, subjectColors[colorIndex]);
  });
  
  return colorMap;
};

// Icons
const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

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

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// Helper to check if a subject is a lab (1.5 credits or name contains 'lab')
const isLabSubject = (subject: Subject): boolean => {
  return subject.credits === 1.5 || subject.subject_name.toLowerCase().includes('lab');
};

export default function SubjectsManager({ subjects, onUpdate }: SubjectsManagerProps) {
  const [newSubject, setNewSubject] = useState<{
    subject_code: string;
    subject_name: string;
    credits: 0 | 1.5 | 2 | 3 | 4;
    zero_credit_type?: 'library' | 'seminar' | 'vac';
  }>({
    subject_code: '',
    subject_name: '',
    credits: 3,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    // For library/seminar, auto-set the name
    const effectiveName = newSubject.credits === 0 && (newSubject.zero_credit_type === 'library' || newSubject.zero_credit_type === 'seminar')
      ? newSubject.zero_credit_type.charAt(0).toUpperCase() + newSubject.zero_credit_type.slice(1)
      : newSubject.subject_name;

    if (!effectiveName) {
      alert('Please fill in subject name');
      return;
    }

    // For non-zero-credit subjects, subject code is required
    if (newSubject.credits !== 0 && !newSubject.subject_code) {
      alert('Subject code is required for non-zero-credit subjects');
      return;
    }

    // For VAC (0-credit), subject code is also required
    if (newSubject.credits === 0 && newSubject.zero_credit_type === 'vac' && !newSubject.subject_code) {
      alert('Subject code is required for VAC (Value Added Course)');
      return;
    }

    // Check for duplicate codes (only if code exists)
    if (newSubject.subject_code && subjects.some(s => s.subject_code === newSubject.subject_code)) {
      alert('Subject code already exists');
      return;
    }

    // For 0-credit library/seminar without code, use subject name as identifier
    const subjectToAdd: Subject = newSubject.credits === 0 && !newSubject.subject_code
      ? { subject_name: effectiveName, subject_code: undefined, credits: 0, zero_credit_type: newSubject.zero_credit_type }
      : { ...newSubject, subject_name: effectiveName, zero_credit_type: newSubject.credits === 0 ? newSubject.zero_credit_type : undefined };

    onUpdate([...subjects, subjectToAdd]);
    setNewSubject({ subject_code: '', subject_name: '', credits: 3, zero_credit_type: 'library' });
  };

  const handleDelete = (identifier: string | undefined) => {
    const subject = subjects.find(s => s.subject_code === identifier);
    const displayName = subject?.subject_name || identifier || 'Subject';
    if (confirm(`Delete subject ${displayName}?`)) {
      onUpdate(subjects.filter(s => s.subject_code !== identifier));
    }
  };

  const handleEdit = (identifier: string | undefined, field: string, value: any) => {
    onUpdate(
      subjects.map(s =>
        s.subject_code === identifier ? { ...s, [field]: value } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Subject</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {newSubject.credits === 0 ? (
            <>
              <select
                value={newSubject.zero_credit_type}
                onChange={(e) =>
                  setNewSubject({ 
                    ...newSubject, 
                    zero_credit_type: e.target.value as 'library' | 'seminar' | 'vac',
                    subject_code: e.target.value === 'vac' ? newSubject.subject_code : ''
                  })
                }
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm dark:bg-gray-900 dark:text-white"
              >
                <option value="library">Library</option>
                <option value="seminar">Seminar</option>
                <option value="vac">VAC</option>
              </select>
              {newSubject.zero_credit_type === 'vac' ? (
                <>
                  <input
                    type="text"
                    placeholder="VAC Code (required)"
                    value={newSubject.subject_code}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, subject_code: e.target.value.toUpperCase() })
                    }
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 font-mono text-sm dark:bg-gray-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="VAC Name"
                    value={newSubject.subject_name}
                    onChange={(e) =>
                      setNewSubject({ ...newSubject, subject_name: e.target.value })
                    }
                    className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-900 dark:text-white"
                  />
                </>
              ) : (
                <div className="md:col-span-2 text-gray-400 dark:text-gray-500 px-3 py-2 text-xs flex items-center italic">
                  (auto-named)
                </div>
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Subject Code (e.g., CS101)"
                value={newSubject.subject_code}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, subject_code: e.target.value.toUpperCase() })
                }
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 font-mono text-sm dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubject.subject_name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, subject_name: e.target.value })
                }
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 md:col-span-2 dark:bg-gray-900 dark:text-white"
              />
            </>
          )}
          <select
            value={newSubject.credits}
            onChange={(e) => {
              const newCredits = parseFloat(e.target.value) as 0 | 1.5 | 2 | 3 | 4;
              if (newCredits === 0) {
                // Only reset for zero credits
                setNewSubject({ ...newSubject, credits: newCredits, subject_code: '', zero_credit_type: 'library' });
              } else {
                // Keep existing subject_code for other credit types, remove zero_credit_type
                const { zero_credit_type, ...rest } = newSubject;
                setNewSubject({ ...rest, credits: newCredits });
              }
            }}
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-900 dark:text-white"
          >
            <option value={2}>2 Credits</option>
            <option value={3}>3 Credits</option>
            <option value={4}>4 Credits</option>
            <option value={1.5}>1.5 Credits (Lab)</option>
            <option value={0}>0 Credits (Library/Seminar/VAC)</option>
          </select>
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Subject
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {subjects.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
            <BookOpenIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No subjects added yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add your first subject above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const colorMap = getSubjectColors(subjects);
              return subjects.map((subject, index) => {
                const key = subject.subject_code || `${subject.subject_name}-${index}`;
                const colorKey = subject.subject_code || subject.subject_name;
                const color = colorMap.get(colorKey) || subjectColors[0];
                return (
                  <div
                    key={key}
                    className={`${color.bg} ${color.border} border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}
                  >
                    {/* Header with code and delete */}
                    <div className="flex items-start justify-between mb-2">
                      <span className={`font-mono text-xs font-bold ${color.text} bg-white/60 dark:bg-black/30 px-2 py-1 rounded`}>
                        {subject.subject_code || '—'}
                      </span>
                      <button
                        onClick={() => handleDelete(subject.subject_code)}
                        className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                        title="Delete subject"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subject Name */}
                    <input
                      type="text"
                      value={subject.subject_name}
                      onChange={(e) =>
                        handleEdit(subject.subject_code, 'subject_name', e.target.value)
                      }
                      className={`w-full bg-transparent border-none font-semibold text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-1 -ml-1`}
                    />

                    {/* Footer with credits and type */}
                    <div className="flex items-center gap-2 mt-3">
                      <select
                        value={subject.credits}
                        onChange={(e) =>
                          handleEdit(subject.subject_code, 'credits', parseFloat(e.target.value))
                        }
                        className={`${color.badge} text-xs font-semibold rounded-full px-3 py-1 border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50`}
                      >
                        <option value={0}>0 Credits</option>
                        <option value={1.5}>1.5 Credits</option>
                        <option value={3}>3 Credits</option>
                        <option value={4}>4 Credits</option>
                      </select>
                      {/* Type badges with SVG icons */}
                      {isLabSubject(subject) && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                          <BeakerIcon className="w-3 h-3" /> Lab
                        </span>
                      )}
                      {subject.zero_credit_type === 'vac' && (
                        <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                          <AcademicCapIcon className="w-3 h-3" /> VAC
                        </span>
                      )}
                      {subject.zero_credit_type === 'library' && (
                        <span className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                          <BookOpenIcon className="w-3 h-3" /> Library
                        </span>
                      )}
                      {subject.zero_credit_type === 'seminar' && (
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" /> Seminar
                        </span>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
