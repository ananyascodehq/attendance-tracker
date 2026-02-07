'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    
    const supabase = createClient();
    
    // Mark user as onboarded
    const { error } = await supabase
      .from('profiles')
      .update({ onboarded: true })
      .eq('id', user?.id);

    if (error) {
      console.error('Error updating profile:', error);
      // Continue anyway - don't block the user
    }

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 via-white dark:via-gray-900 to-blue-50 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Campus Attendance! 🎉
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {user?.user_metadata?.full_name ? `Hey ${user.user_metadata.full_name.split(' ')[0]}, let's` : "Let's"} get you set up in less than a minute.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid gap-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Track Daily Attendance</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Log your attendance with one tap. Default is present!</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Never Fall Below 75%</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">See real-time stats and get warnings before it's too late.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Plan Your Leaves</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Simulate leave impact before you take time off.</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📋 Quick Setup (Settings Page)</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>1. Add your subjects (name, code, credits)</li>
              <li>2. Build your timetable (drag & drop)</li>
              <li>3. Set semester dates & holidays</li>
            </ol>
          </div>

          {/* CTA */}
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting up...
              </>
            ) : (
              <>
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Your data is stored locally and synced to your account.
        </p>
      </div>
    </div>
  );
}
