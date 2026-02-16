'use client';

import { useState } from 'react';
import { useData } from '@/components/DataProvider';
import { useAuth } from '@/components/AuthProvider';
import { Spinner } from '@/components/Spinner';
import * as db from '@/lib/supabase/database';
import { DEPARTMENT_ABBREVIATIONS, TimetableTemplate } from '@/types/database';

// Icons
const ShareIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface ShareTimetableButtonProps {
  variant?: 'button' | 'card';
  className?: string;
}

export function ShareTimetableButton({ variant = 'button', className = '' }: ShareTimetableButtonProps) {
  const { data, semesterData, activeSemester } = useData();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<TimetableTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Form state for department/year/section
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('3');
  const [section, setSection] = useState('');

  const handleOpenModal = () => {
    if (!data || data.timetable.length === 0) {
      setError('Add at least one class to your timetable before sharing');
      setStep('result');
      setIsOpen(true);
      return;
    }
    setStep('form');
    setError(null);
    setTemplate(null);
    setIsOpen(true);
  };

  const handleGenerateCode = async () => {
    if (!data || !semesterData || !activeSemester || !user) return;
    if (!department) {
      setError('Please select your department');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const deptAbbrev = DEPARTMENT_ABBREVIATIONS[department] || department.slice(0, 2).toUpperCase();
      const yearNum = parseInt(year) || 3;
      const sectionVal = section || null;

      const { slots, subjects } = db.convertToTemplateFormat(
        semesterData.timetable,
        semesterData.subjects
      );

      // Generate base share code: CS3A-K26
      const yearShort = new Date().getFullYear().toString().slice(-2);
      const baseCode = `${deptAbbrev}${yearNum}${sectionVal || ''}-K${yearShort}`.toUpperCase();

      // Check if user already has a template
      const existingTemplates = await db.getTemplatesByUser();
      const existingForDept = existingTemplates.find(
        t => t.department === department && t.year === yearNum && t.section === sectionVal
      );

      if (existingForDept) {
        // Update existing template
        const updated = await db.updateTemplate(existingForDept.id, { slots, subjects });
        setTemplate(updated);
      } else {
        // Create new template
        const newTemplate = await db.createTemplate({
          share_code: baseCode,
          department,
          year: yearNum,
          semester: parseInt(activeSemester.name.match(/\d+/)?.[0] || '1'),
          section: sectionVal,
          slots,
          subjects,
        });
        setTemplate(newTemplate);
      }

      setStep('result');
    } catch (err) {
      console.error('Failed to create template:', err);
      setError('Failed to generate share code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Legacy handleShare for backwards compat
  const handleShare = handleOpenModal;

  const handleCopy = async () => {
    if (!template) return;
    try {
      await navigator.clipboard.writeText(template.share_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWhatsAppShare = () => {
    if (!template) return;
    const message = encodeURIComponent(
      `Hey! I'm using Campus Attendance Tracker. Import my timetable with code: ${template.share_code}\n\nDownload: https://attendance.svce.ac.in`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setCopied(false);
  };

  // Button variant
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {loading ? (
            <Spinner size="xs" color="white" />
          ) : (
            <ShareIcon className="w-5 h-5" />
          )}
          Share Timetable
        </button>

        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {error ? 'Cannot Share' : step === 'form' ? 'Share Your Timetable' : 'Share Code Generated!'}
                </h3>
                <button
                  onClick={handleClose}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              {error && step === 'result' ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <XIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{error}</p>
                </div>
              ) : step === 'form' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your details to generate a shareable code for your timetable.
                  </p>
                  
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}

                  {/* Department Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select department...</option>
                      {Object.entries(DEPARTMENT_ABBREVIATIONS).map(([name, abbrev]) => (
                        <option key={abbrev} value={name}>{name} ({abbrev})</option>
                      ))}
                    </select>
                  </div>

                  {/* Year Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year *
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  {/* Section Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Section (optional)
                    </label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value.toUpperCase())}
                      placeholder="A, B, C..."
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleGenerateCode}
                    disabled={loading || !department}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Spinner size="xs" color="white" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ShareIcon className="w-5 h-5" />
                        Generate Share Code
                      </>
                    )}
                  </button>
                </div>
              ) : template ? (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Your share code
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                      <code className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                        {template.share_code}
                      </code>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                      {template.use_count} student{template.use_count !== 1 ? 's' : ''} imported this
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Tip: Regenerating updates this code with your latest timetable
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="w-5 h-5" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="w-5 h-5" />
                          Copy Code
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      Share on WhatsApp
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </>
    );
  }

  // Card variant (for settings page)
  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShareIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white">Share with Classmates</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Help your friends skip the setup — share your timetable code!
          </p>
          <button
            onClick={handleShare}
            disabled={loading}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Spinner size="xs" color="white" />
            ) : (
              <ShareIcon className="w-4 h-4" />
            )}
            Generate Code
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {error && step === 'result' ? 'Cannot Share' : step === 'form' ? 'Share Your Timetable' : 'Share Code Generated!'}
              </h3>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {error && step === 'result' ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">{error}</p>
              </div>
            ) : step === 'form' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter your details to generate a shareable code for your timetable.
                </p>
                
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                {/* Department Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select department...</option>
                    {Object.entries(DEPARTMENT_ABBREVIATIONS).map(([name, abbrev]) => (
                      <option key={abbrev} value={name}>{name} ({abbrev})</option>
                    ))}
                  </select>
                </div>

                {/* Year Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* Section Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Section (optional)
                  </label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                    placeholder="A, B, C..."
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleGenerateCode}
                  disabled={loading || !department}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Spinner size="xs" color="white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ShareIcon className="w-5 h-5" />
                      Generate Share Code
                    </>
                  )}
                </button>
              </div>
            ) : template ? (
              <>
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Your share code
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                    <code className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                      {template.share_code}
                    </code>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    {template.use_count} student{template.use_count !== 1 ? 's' : ''} imported this
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Tip: Regenerating updates this code with your latest timetable
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="w-5 h-5" />
                        Copy Code
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <WhatsAppIcon className="w-5 h-5" />
                    Share on WhatsApp
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
