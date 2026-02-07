'use client';

import React from 'react';

// ─── Page-level loading screens ─────────────────────────────────────────────

interface PageLoaderProps {
  message?: string;
  variant?: 'dashboard' | 'attendance' | 'planner' | 'settings';
}

const gradients: Record<string, string> = {
  dashboard: 'from-blue-50 via-indigo-50 to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800',
  attendance: 'from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800',
  planner: 'from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800',
  settings: 'from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800',
};

const accentColors: Record<string, { ring: string; dot: string; text: string }> = {
  dashboard: { ring: 'border-blue-500/30', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  attendance: { ring: 'border-emerald-500/30', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  planner: { ring: 'border-amber-500/30', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  settings: { ring: 'border-gray-400/30', dot: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400' },
};

export function PageLoader({ message, variant = 'dashboard' }: PageLoaderProps) {
  const bg = gradients[variant];
  const colors = accentColors[variant];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bg} flex items-center justify-center p-6`}>
      <div className="flex flex-col items-center gap-6">
        {/* Orbital spinner */}
        <div className="relative w-16 h-16">
          {/* Outer ring — slow spin */}
          <div className={`absolute inset-0 rounded-full border-2 ${colors.ring} spinner-orbit`} />
          {/* Middle ring — reverse spin */}
          <div className={`absolute inset-2 rounded-full border-2 ${colors.ring} spinner-orbit-reverse`} />
          {/* Center pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${colors.dot} spinner-breathe`} />
          </div>
          {/* Orbiting dot */}
          <div className="absolute inset-0 spinner-orbit">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${colors.dot} shadow-lg`} />
          </div>
        </div>
        {/* Message */}
        {message && (
          <p className={`text-sm font-medium ${colors.text} spinner-fade-in`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Inline / card-level spinner ────────────────────────────────────────────

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'blue' | 'emerald' | 'white' | 'gray';
  label?: string;
}

const sizeMap = { xs: 'w-4 h-4', sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
const borderMap = { xs: 'border-[2px]', sm: 'border-2', md: 'border-[3px]', lg: 'border-4' };
const dotSizeMap = { xs: 'w-1 h-1', sm: 'w-1.5 h-1.5', md: 'w-2 h-2', lg: 'w-3 h-3' };

const colorMap = {
  blue: { border: 'border-blue-500/25', track: 'border-t-blue-500', dot: 'bg-blue-500' },
  emerald: { border: 'border-emerald-500/25', track: 'border-t-emerald-500', dot: 'bg-emerald-500' },
  white: { border: 'border-white/25', track: 'border-t-white', dot: 'bg-white' },
  gray: { border: 'border-gray-400/25', track: 'border-t-gray-400', dot: 'bg-gray-400' },
};

export function Spinner({ size = 'md', color = 'blue', label }: SpinnerProps) {
  const s = sizeMap[size];
  const b = borderMap[size];
  const c = colorMap[color];

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${s} rounded-full ${b} ${c.border} ${c.track} spinner-smooth`} />
      {label && <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>}
    </span>
  );
}

// ─── Button spinner (replaces text inside buttons during async actions) ─────

interface ButtonSpinnerProps {
  children: React.ReactNode;
  loading: boolean;
  loadingText?: string;
}

export function ButtonSpinner({ children, loading, loadingText }: ButtonSpinnerProps) {
  if (!loading) return <>{children}</>;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white spinner-smooth" />
      {loadingText && <span>{loadingText}</span>}
    </span>
  );
}

// ─── Dots loader (trendy bouncing dots) ─────────────────────────────────────

interface DotsLoaderProps {
  color?: 'blue' | 'emerald' | 'white' | 'gray';
  size?: 'sm' | 'md';
}

export function DotsLoader({ color = 'blue', size = 'md' }: DotsLoaderProps) {
  const dotColor = colorMap[color].dot;
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5';

  return (
    <span className={`inline-flex items-center ${gap}`}>
      <span className={`${dotSize} rounded-full ${dotColor} spinner-bounce-1`} />
      <span className={`${dotSize} rounded-full ${dotColor} spinner-bounce-2`} />
      <span className={`${dotSize} rounded-full ${dotColor} spinner-bounce-3`} />
    </span>
  );
}
