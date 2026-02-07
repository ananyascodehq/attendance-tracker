'use client';

import { useState } from 'react';
import { useData } from '@/components/DataProvider';
import { PageLoader } from '@/components/Spinner';
import { LeaveSimulator } from '@/components/LeaveSimulator';
import { OdTracker } from '@/components/OdTracker';
import { SafeMarginCalculator } from '@/components/SafeMarginCalculator';

type ToolId = 'leave' | 'od' | 'margin';

interface ToolConfig {
  id: ToolId;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}

// SVG Icons
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TicketIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const WrenchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarDaysIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const FlagIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const tools: ToolConfig[] = [
  {
    id: 'leave',
    name: 'Leave Simulator',
    icon: <CalendarIcon className="w-7 h-7" />,
    description: 'See how taking leave affects your attendance percentage',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
  },
  {
    id: 'od',
    name: 'OD Tracker',
    icon: <TicketIcon className="w-7 h-7" />,
    description: 'Log On-Duty days that count as present',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
  },
  {
    id: 'margin',
    name: 'Safe Margin Calculator',
    icon: <ShieldIcon className="w-7 h-7" />,
    description: 'Find out how many classes you can skip safely',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconColor: 'text-emerald-600',
  },
];

export default function PlannerPage() {
  const { data, loading } = useData();
  const [expandedTool, setExpandedTool] = useState<ToolId | null>('leave');

  if (loading) {
    return <PageLoader variant="planner" message="Loading tools..." />;
  }

  if (!data) {
    return <div className="text-center text-gray-700 dark:text-gray-200 py-20">No data found</div>;
  }

  const toggleTool = (id: ToolId) => {
    setExpandedTool(expandedTool === id ? null : id);
  };

  const renderToolContent = (id: ToolId) => {
    switch (id) {
      case 'leave':
        return <LeaveSimulator />;
      case 'od':
        return <OdTracker />;
      case 'margin':
        return <SafeMarginCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-900 via-white dark:via-gray-900 to-slate-100 dark:to-gray-800">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Hero Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <WrenchIcon className="w-8 h-8 text-gray-700 dark:text-gray-200" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planning Tools</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-xl">
            Simulate absences, track OD days, and calculate your safe margin — all in one place.
          </p>
          
          {/* Semester Info Banner */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Semester:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.semester_config.start_date || '?'} → {data.semester_config.end_date || '?'}
              </span>
            </div>
          </div>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                expandedTool === tool.id
                  ? `${tool.bgColor} dark:bg-opacity-20 ${tool.borderColor} shadow-lg scale-[1.02]`
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`${expandedTool === tool.id ? tool.iconColor : 'text-gray-400 dark:text-gray-500'}`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold ${expandedTool === tool.id ? tool.color : 'text-gray-900 dark:text-white'}`}>
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                  expandedTool === tool.id ? 'rotate-180' : ''
                }`} />
              </div>
            </button>
          ))}
        </div>

        {/* Expanded Tool Content */}
        {expandedTool && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className={`rounded-2xl border-2 overflow-hidden ${
              tools.find(t => t.id === expandedTool)?.borderColor
            } ${tools.find(t => t.id === expandedTool)?.bgColor} dark:bg-opacity-20`}>
              <div className="bg-white dark:bg-gray-800 rounded-xl m-1">
                {renderToolContent(expandedTool)}
              </div>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
              <LightBulbIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-300">Pro Tips</h3>
              <ul className="mt-2 text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Use the <strong>Leave Simulator</strong> before requesting leave to check impact</li>
                <li>• Log <strong>OD days</strong> immediately — they boost your attendance!</li>
                <li>• Check your <strong>Safe Margin</strong> weekly to plan bunks wisely</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
