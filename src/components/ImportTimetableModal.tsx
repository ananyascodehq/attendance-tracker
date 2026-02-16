'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/components/DataProvider';
import { Spinner } from '@/components/Spinner';
import * as db from '@/lib/supabase/database';
import { TimetableTemplate, TemplateSlot, TemplateSubject } from '@/types/database';
import { format } from 'date-fns';

// Icons
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

interface ImportTimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function ImportTimetableModal({ isOpen, onClose, onImportComplete }: ImportTimetableModalProps) {
  const { data, semesterData, activeSemester, updateAllSubjects, updateAllTimetable, refresh } = useData();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<TimetableTemplate | null>(null);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setTemplate(null);
      setShowOverwriteWarning(false);
      setImportSuccess(false);
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!code.trim()) {
      setError('Please enter a share code');
      return;
    }

    setLoading(true);
    setError(null);
    setTemplate(null);

    try {
      const found = await db.getTemplateByCode(code.trim());
      
      if (!found) {
        setError('Code not found. Check spelling?');
        return;
      }

      // Validate template has slots
      if (!found.slots || found.slots.length === 0) {
        setError('This template has no classes configured');
        return;
      }

      setTemplate(found);

      // Check if user already has timetable slots
      if (data && data.timetable.length > 0) {
        setShowOverwriteWarning(true);
      }
    } catch (err) {
      console.error('Failed to fetch template:', err);
      setError('Failed to fetch template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!template || !semesterData || !activeSemester) return;

    setImporting(true);
    setError(null);

    try {
      // Convert template subjects to our format and save
      const subjectsToImport = template.subjects.map(s => ({
        subject_code: s.subject_code || undefined,
        subject_name: s.subject_name,
        credits: s.credits as 0 | 1.5 | 2 | 3 | 4,
        zero_credit_type: s.zero_credit_type as 'library' | 'seminar' | 'vac' | undefined,
      }));

      await updateAllSubjects(subjectsToImport);

      // Convert template slots to our format and save
      const slotsToImport = template.slots.map(s => ({
        id: `imported-${s.day_of_week}-${s.period_number}`,
        day_of_week: s.day_of_week,
        period_number: s.period_number,
        subject_code: s.subject_code || undefined,
        start_time: s.start_time,
        end_time: s.end_time,
      }));

      await updateAllTimetable(slotsToImport);

      // Increment usage counter
      await db.incrementTemplateUseCount(template.id);

      // Refresh data
      await refresh();

      setImportSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        onImportComplete?.();
      }, 1500);
    } catch (err) {
      console.error('Failed to import template:', err);
      setError('Import failed. Try again or set up manually.');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Import Timetable
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Success State */}
          {importSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Import Successful!
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Your timetable has been set up
              </p>
            </div>
          ) : (
            <>
              {/* Search Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter share code from your classmate
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g., CS3A-K26"
                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-lg tracking-wider placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={loading || importing}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={loading || importing || !code.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Spinner size="xs" color="white" />
                    ) : (
                      <SearchIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Template Preview */}
              {template && !error && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Template Found
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{template.department}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <UsersIcon className="w-4 h-4" />
                        <span>{template.use_count} students imported</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <DownloadIcon className="w-4 h-4" />
                        <span>{template.slots.length} periods • {template.subjects.length} subjects</span>
                      </div>
                      {/* Updated date with freshness indicator */}
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Updated {format(new Date(template.updated_at), 'MMM d, yyyy')}
                          {(() => {
                            const daysSinceUpdate = Math.floor((Date.now() - new Date(template.updated_at).getTime()) / (1000 * 60 * 60 * 24));
                            if (daysSinceUpdate > 60) return <span className="ml-1 text-amber-600 dark:text-amber-400">(may be outdated)</span>;
                            if (daysSinceUpdate <= 7) return <span className="ml-1 text-green-600 dark:text-green-400">(recent)</span>;
                            return null;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overwrite Warning */}
                  {showOverwriteWarning && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <AlertIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          This will replace your current timetable
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Your {data?.timetable.length || 0} existing periods will be overwritten
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Import Button */}
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Spinner size="xs" color="white" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="w-5 h-5" />
                        Import Timetable
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Help Text */}
              {!template && !error && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                  Ask a classmate for their share code to import their timetable
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Standalone trigger button for import
interface ImportTimetableButtonProps {
  variant?: 'button' | 'card';
  className?: string;
  onImportComplete?: () => void;
}

export function ImportTimetableButton({ variant = 'button', className = '', onImportComplete }: ImportTimetableButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors ${className}`}
        >
          <DownloadIcon className="w-5 h-5" />
          Import Timetable
        </button>
        <ImportTimetableModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
          onImportComplete={onImportComplete}
        />
      </>
    );
  }

  // Card variant
  return (
    <>
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <DownloadIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white">Import from Classmate</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Have a share code? Import a timetable in seconds!
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DownloadIcon className="w-4 h-4" />
              Enter Code
            </button>
          </div>
        </div>
      </div>
      <ImportTimetableModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onImportComplete={onImportComplete}
      />
    </>
  );
}
